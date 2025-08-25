
'use client';

import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { type MenuItem, menuItems as defaultMenuItems, allIcons, type LucideIcon } from './menu-items-v2';

// Helper function to get icon component from its name string
const getIconComponent = (iconName?: string): LucideIcon => {
    if (iconName && iconName in allIcons) {
        return allIcons[iconName as keyof typeof allIcons];
    }
    return allIcons.Package; // Default icon
};

// Firestore data structure for a menu item
interface MenuItemDTO {
    id: string;
    title: string;
    href: string;
    iconName: string; // Store icon name as a string
    access?: 'all' | 'admin';
    comingSoon?: boolean;
}

const menuConfigDocRef = doc(db, 'app-settings', 'menu-grid');

const processDocData = (data: any): MenuItem[] => {
    const storedItems = (data?.items || []) as MenuItemDTO[];
    // Re-hydrate the menu items with the actual icon components
    return storedItems.map(item => ({
        ...item,
        icon: getIconComponent(item.iconName),
        access: item.access ?? 'all',
        comingSoon: item.comingSoon ?? false,
    }));
};

// --- Real-time Listener Setup ---
type Listener = (config: MenuItem[]) => void;
let listener: Listener | null = null;
let isListenerAttached = false;

export const menuConfigListener = {
  subscribe: (newListener: Listener): (() => void) => {
    listener = newListener;
    if (!isListenerAttached) {
      attachListener();
    }
    return () => {
      listener = null; // Don't detach Firestore listener, just the UI listener
    };
  },
  notify: (config: MenuItem[]) => {
    if (listener) {
      listener(config);
    }
  },
};

const attachListener = () => {
  if (isListenerAttached) return;
  isListenerAttached = true;
  
  onSnapshot(menuConfigDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const config = processDocData(docSnap.data());
      menuConfigListener.notify(config);
    } else {
      console.log("No menu config found, providing defaults.");
      menuConfigListener.notify(defaultMenuItems);
    }
  }, (error) => {
    console.error("Error with real-time menu listener:", error);
    // Fallback to defaults on error
    menuConfigListener.notify(defaultMenuItems);
  });
};


// One-time fetch function
export const getMenuConfig = async (): Promise<MenuItem[]> => {
    try {
        const docSnap = await getDoc(menuConfigDocRef);

        if (docSnap.exists()) {
            return processDocData(docSnap.data());
        } else {
            console.log("No menu config found, initializing with defaults.");
            const defaultDTOs: MenuItemDTO[] = defaultMenuItems.map(item => ({
                id: item.id,
                title: item.title,
                href: item.href,
                iconName: item.icon.displayName || 'Package',
                access: item.access || 'all',
                comingSoon: item.comingSoon || false,
            }));
            await setDoc(menuConfigDocRef, { items: defaultDTOs });
            return defaultMenuItems;
        }
    } catch (error) {
        console.error("Error fetching menu configuration:", error);
        return defaultMenuItems;
    }
};

export const saveMenuConfig = async (items: MenuItem[]) => {
    const itemsToStore: MenuItemDTO[] = items.map(item => ({
        id: item.id,
        title: item.title,
        href: item.href,
        iconName: (item as any).iconName || item.icon.displayName || 'Package',
        access: item.access ?? 'all',
        comingSoon: item.comingSoon ?? false,
    }));
    
    await setDoc(menuConfigDocRef, { items: itemsToStore });
};
