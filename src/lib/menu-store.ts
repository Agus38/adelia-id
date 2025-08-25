
'use client';

import { doc, getDoc, setDoc } from 'firebase/firestore';
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
    access: 'all' | 'admin';
    comingSoon: boolean;
}

const menuConfigDocRef = doc(db, 'app-settings', 'menu-grid');

export const getMenuConfig = async (): Promise<MenuItem[]> => {
    try {
        const docSnap = await getDoc(menuConfigDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const storedItems = (data.items || []) as MenuItemDTO[];
            // Re-hydrate the menu items with the actual icon components
            return storedItems.map(item => ({
                ...item,
                icon: getIconComponent(item.iconName)
            }));
        } else {
            // If the document doesn't exist, initialize it with default values
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
        // Return default items as a fallback on error
        return defaultMenuItems;
    }
};

export const saveMenuConfig = async (items: MenuItem[]) => {
    // Convert full MenuItem objects to lightweight DTOs for storing in Firestore.
    // Explicitly map each field to ensure no 'undefined' values are sent.
    const itemsToStore: MenuItemDTO[] = items.map(item => ({
        id: item.id,
        title: item.title,
        href: item.href,
        iconName: (item as any).iconName || item.icon.displayName || 'Package',
        access: item.access ?? 'all', // Fallback to 'all' if undefined
        comingSoon: item.comingSoon ?? false, // Fallback to false if undefined
    }));
    
    await setDoc(menuConfigDocRef, { items: itemsToStore });
};
