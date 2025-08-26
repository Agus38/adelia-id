

'use client';

import * as React from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
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

// --- DTOs for Firestore ---
interface MenuItemDTO {
  id: string;
  title: string;
  href: string;
  iconName: string;
  access: 'all' | 'admin';
  comingSoon: boolean;
}

interface BannerSlideDTO {
  id: number;
  title: string;
  description: string;
  image: string;
  hint: string;
  visible: boolean;
}


// --- Type Definitions ---
export interface BannerSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  hint: string;
  visible: boolean;
}


// --- Firestore Document References ---
const menuConfigDocRef = doc(db, 'app-settings', 'menu-grid');
const sidebarMenuConfigDocRef = doc(db, 'app-settings', 'sidebar-menu');
const bannerConfigDocRef = doc(db, 'app-settings', 'banner-slides');


// --- Default Data ---
const defaultBannerSlides: BannerSlide[] = [
  {
    id: 1,
    title: 'Solusi Inovatif',
    description: 'Tingkatkan produktivitas bisnis Anda dengan alat canggih kami.',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvbW90aW9uYWwlMjBiYW5uZXJ8ZW58MHx8fHwxNzU1NTUwMzk2fDA',
    hint: 'promotional banner',
    visible: true,
  },
  {
    id: 2,
    title: 'Analitik Cerdas',
    description: 'Dapatkan wawasan mendalam dari data Anda dengan dasbor interaktif.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGF0YSUyMGFuYWx5dGljc3xlbnwwfHx8fDE3NTU1NTAzOTZ8MA',
    hint: 'data analytics',
    visible: true,
  },
  {
    id: 3,
    title: 'Asisten AI Nexus',
    description: 'Biarkan AI membantu Anda menyelesaikan tugas lebih cepat dan efisien.',
    image: 'https://images.unsplash.com/photo-1620712943543-285f716a8ae6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXJ0aWZpY2lhbCUyMGludGVsbGlnZW5jZXxlbnwwfHx8fDE3NTU1NTAzOTV8MA',
    hint: 'artificial intelligence',
    visible: true,
  }
];


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
        if (docSnap.exists() && docSnap.data()?.items) {
          const storedItems = docSnap.data()?.items as MenuItemDTO[];
          const hydratedItems = storedItems.map((item) => ({
            ...item,
            icon: getIconComponent(item.iconName),
          }));
          set({ menuItems: hydratedItems, isLoading: false, error: null });
        } else {
          set({ menuItems: defaultMenuItems, isLoading: false, error: null });
        }
      },
      (error) => {
        console.error("Error fetching menu config: ", error);
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
    iconName: (item as any).iconName || (item.icon && (item.icon as any).displayName) || 'Package',
    access: item.access || 'all',
    comingSoon: item.comingSoon || false,
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
        if (docSnap.exists() && docSnap.data()?.items) {
          const storedItems = docSnap.data()?.items as MenuItemDTO[];
          const hydratedItems = storedItems.map((item) => ({
            ...item,
            icon: getIconComponent(item.iconName),
          }));
          set({ sidebarMenuItems: hydratedItems, isLoading: false, error: null });
        } else {
          set({ sidebarMenuItems: defaultSidebarItems, isLoading: false, error: null });
        }
      },
      (error) => {
         console.error("Error fetching sidebar menu config: ", error);
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
    iconName: (item as any).iconName || (item.icon && (item.icon as any).displayName) || 'Package',
    access: item.access || 'all',
    comingSoon: item.comingSoon || false,
  }));
  await setDoc(sidebarMenuConfigDocRef, { items: itemsToStore });
};


// --- Banner Slides Store ---
interface BannerStoreState {
  bannerSlides: BannerSlide[];
  isLoading: boolean;
  error: Error | null;
  initializeListener: () => () => void;
}

const useBannerStore = create<BannerStoreState>((set) => ({
    bannerSlides: [],
    isLoading: true,
    error: null,
    initializeListener: () => {
        const unsubscribe = onSnapshot(bannerConfigDocRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data()?.slides) {
                const storedSlides = docSnap.data()?.slides as BannerSlideDTO[];
                set({ bannerSlides: storedSlides, isLoading: false, error: null });
            } else {
                set({ bannerSlides: defaultBannerSlides, isLoading: false, error: null });
            }
        }, (error) => {
             console.error("Error fetching banner config: ", error);
            set({ bannerSlides: defaultBannerSlides, isLoading: false, error });
        });
        return unsubscribe;
    }
}));

export const useBannerConfig = () => {
    const { bannerSlides, isLoading, initializeListener } = useBannerStore();
    React.useEffect(() => {
        const unsubscribe = initializeListener();
        return () => unsubscribe();
    }, [initializeListener]);
    return { bannerSlides, isLoading };
}

export const saveBannerConfig = async (slides: BannerSlide[]) => {
    const slidesToStore: BannerSlideDTO[] = slides.map(slide => ({
        id: slide.id,
        title: slide.title,
        description: slide.description,
        image: slide.image,
        hint: slide.hint,
        visible: slide.visible,
    }));
    await setDoc(bannerConfigDocRef, { slides: slidesToStore });
}
