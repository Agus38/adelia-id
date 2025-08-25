
'use client';

import * as React from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { type MenuItem, menuItems as defaultMenuItems, allIcons, type LucideIcon } from './menu-items-v2';
import { create } from 'zustand';

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

// Zustand store for real-time state management
interface MenuStoreState {
    menuItems: MenuItem[];
    isLoading: boolean;
    error: Error | null;
    initializeListener: () => () => void; // Returns the unsubscribe function
    setMenuItems: (items: MenuItem[]) => void;
}

const useMenuStore = create<MenuStoreState>((set) => ({
    menuItems: [],
    isLoading: true,
    error: null,
    setMenuItems: (items) => set({ menuItems: items, isLoading: false, error: null }),
    initializeListener: () => {
        const unsubscribe = onSnapshot(menuConfigDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const storedItems = (docSnap.data()?.items || []) as MenuItemDTO[];
                const hydratedItems = storedItems.map(item => ({
                    ...item,
                    icon: getIconComponent(item.iconName),
                    access: item.access ?? 'all',
                    comingSoon: item.comingSoon ?? false,
                }));
                set({ menuItems: hydratedItems, isLoading: false, error: null });
            } else {
                console.log("No menu config found, providing defaults.");
                set({ menuItems: defaultMenuItems, isLoading: false, error: null });
            }
        }, (error) => {
            console.error("Error with real-time menu listener:", error);
            set({ menuItems: defaultMenuItems, isLoading: false, error });
        });

        return unsubscribe; // Return the unsubscribe function for cleanup
    },
}));

// Custom hook for components to use
export const useMenuConfig = () => {
    const { menuItems, isLoading, initializeListener } = useMenuStore();

    React.useEffect(() => {
        // Initialize listener only once
        const unsubscribe = initializeListener();
        return () => unsubscribe(); // Cleanup on unmount
    }, [initializeListener]);

    return { menuItems, isLoading };
};

export const getMenuConfig = async (): Promise<MenuItem[]> => {
    try {
        const docSnap = await getDoc(menuConfigDocRef);
        if (docSnap.exists()) {
            const storedItems = (docSnap.data()?.items || []) as MenuItemDTO[];
            return storedItems.map(item => ({
                ...item,
                icon: getIconComponent(item.iconName),
                access: item.access ?? 'all',
                comingSoon: item.comingSoon ?? false,
            }));
        } else {
            console.log("No menu config found, initializing with defaults.");
            await saveMenuConfig(defaultMenuItems);
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
