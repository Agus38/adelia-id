

'use client';

import * as React from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import {
  type MenuItem,
  menuItems as defaultMenuItems,
  allMenuItems as defaultSidebarItems,
  allIcons,
  type LucideIcon,
} from './menu-items-v2';
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
const sidebarMenuConfigDocRef = doc(db, 'app-settings', 'sidebar-menu');

// --- Menu Grid Store ---
interface MenuStoreState {
  menuItems: MenuItem[];
  isLoading: boolean;
  error: Error | null;
  initializeListener: () => () => void;
}

const useMenuStore = create<MenuStoreState>((set) => ({
  menuItems: [],
  isLoading: true,
  error: null,
  initializeListener: () => {
    const unsubscribe = onSnapshot(
      menuConfigDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const storedItems = (docSnap.data()?.items || []) as MenuItemDTO[];
          const hydratedItems = storedItems.map((item) => ({
            ...item,
            icon: getIconComponent(item.iconName),
            access: item.access ?? 'all',
            comingSoon: item.comingSoon ?? false,
          }));
          set({ menuItems: hydratedItems, isLoading: false, error: null });
        } else {
          console.log('No menu config found, providing defaults.');
          set({ menuItems: defaultMenuItems, isLoading: false, error: null });
        }
      },
      (error) => {
        console.error('Error with real-time menu listener:', error);
        set({ menuItems: defaultMenuItems, isLoading: false, error });
      }
    );
    return unsubscribe;
  },
}));

export const useMenuConfig = () => {
  const { menuItems, isLoading, initializeListener } = useMenuStore();
  React.useEffect(() => {
    const unsubscribe = initializeListener();
    return () => unsubscribe();
  }, [initializeListener]);
  return { menuItems, isLoading };
};

export const saveMenuConfig = async (items: MenuItem[]) => {
  const itemsToStore: MenuItemDTO[] = items.map((item) => ({
    id: item.id,
    title: item.title,
    href: item.href,
    iconName:
      (item as any).iconName ||
      (item.icon && (item.icon as any).displayName) ||
      'Package',
    access: item.access ?? 'all',
    comingSoon: item.comingSoon ?? false,
  }));
  await setDoc(menuConfigDocRef, { items: itemsToStore });
};

// --- Sidebar Menu Store ---
interface SidebarMenuStoreState {
  sidebarMenuItems: MenuItem[];
  isLoading: boolean;
  error: Error | null;
  initializeListener: () => () => void;
}

const useSidebarMenuStore = create<SidebarMenuStoreState>((set) => ({
  sidebarMenuItems: [],
  isLoading: true,
  error: null,
  initializeListener: () => {
    const unsubscribe = onSnapshot(
      sidebarMenuConfigDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const storedItems = (docSnap.data()?.items || []) as MenuItemDTO[];
          const hydratedItems = storedItems.map((item) => ({
            ...item,
            icon: getIconComponent(item.iconName),
            access: item.access ?? 'all',
            comingSoon: item.comingSoon ?? false, // Should not be needed but for safety
          }));
          set({ sidebarMenuItems: hydratedItems, isLoading: false, error: null });
        } else {
          console.log('No sidebar menu config found, providing defaults.');
          set({ sidebarMenuItems: defaultSidebarItems, isLoading: false, error: null });
        }
      },
      (error) => {
        console.error('Error with real-time sidebar menu listener:', error);
        set({ sidebarMenuItems: defaultSidebarItems, isLoading: false, error });
      }
    );
    return unsubscribe;
  },
}));

export const useSidebarMenuConfig = () => {
  const { sidebarMenuItems, isLoading, initializeListener } = useSidebarMenuStore();
  React.useEffect(() => {
    const unsubscribe = initializeListener();
    return () => unsubscribe();
  }, [initializeListener]);
  return { sidebarMenuItems, isLoading };
};

export const saveSidebarMenuConfig = async (items: MenuItem[]) => {
  const itemsToStore: MenuItemDTO[] = items.map((item) => ({
    id: item.id,
    title: item.title,
    href: item.href,
    iconName:
      (item as any).iconName ||
      (item.icon && (item.icon as any).displayName) ||
      'Package',
    access: item.access ?? 'all',
    comingSoon: item.comingSoon ?? false,
  }));
  await setDoc(sidebarMenuConfigDocRef, { items: itemsToStore });
};
