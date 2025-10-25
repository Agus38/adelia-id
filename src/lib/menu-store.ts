

'use client';

import * as React from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import {
  type MenuItem,
  menuItems as defaultMenuItems,
  allMenuItems as defaultAllMenuItems,
  defaultAdminMenuItems,
  allIcons,
  type LucideIcon,
  homeMenuItem,
} from './menu-items-v2';
import { create } from 'zustand';
import { Logo } from '@/components/icons';


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
  access: string;
  comingSoon: boolean;
  badgeText?: string;
  isUnderMaintenance?: boolean;
  requiresAuth?: boolean;
}

interface BannerSlideDTO {
  id: number;
  title: string;
  description: string;
  image: string;
  hint: string;
  visible: boolean;
  url?: string;
}

interface BrandingConfigDTO {
  appName: string;
  logoType: 'icon' | 'image';
  iconName?: string;
  imageUrl?: string;
  footerText?: string;
}

interface LoginPageConfigDTO {
  imageUrl: string;
  aiHint: string;
}

interface RegisterPageConfigDTO {
  imageUrl: string;
  aiHint: string;
}


interface SocialLinkDTO {
  id: string; // Added for stable key
  name: string;
  url: string;
  iconType: 'icon' | 'image';
  iconName?: string;
  iconImageUrl?: string;
}

interface DeveloperInfoDTO {
    name: string;
    title: string;
    avatarUrl: string;
    bio: string;
    socialLinks: SocialLinkDTO[];
}

interface SessionConfigDTO {
    durationMinutes: number;
}

interface AboutInfoDTO {
  appName: string;
  version: string;
  description: string;
  features: string[];
}

interface PromoPopupConfigDTO {
  enabled: boolean;
  imageUrl: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  promoVersion?: number;
}

interface RoleDTO {
  id: string;
  name: string;
}

export interface ReportItem {
    id: string;
    label: string;
}

interface SmwManyarConfigDTO {
    sisaIkanItems: ReportItem[];
    terjualItems: ReportItem[];
    onlineSalesItems: ReportItem[];
}

interface TeamMemberDTO {
    id: number;
    name: string;
    title: string;
    avatarUrl: string;
    avatarFallback: string;
}

interface FaqItemDTO {
    id: string;
    question: string;
    answer: string;
}

interface ContactMethodDTO {
    id: string;
    iconName: string;
    title: string;
    value: string;
    action: string;
    actionLabel: string;
}

interface SupportPageConfigDTO {
    faqItems: FaqItemDTO[];
    contactMethods: ContactMethodDTO[];
}


// --- Type Definitions ---
export interface BannerSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  hint: string;
  visible: boolean;
  url?: string;
}

export interface BrandingConfig {
  appName: string;
  logoType: 'icon' | 'image';
  icon?: LucideIcon;
  iconName?: string;
  imageUrl?: string;
  footerText?: string;
}

export interface LoginPageConfig {
    imageUrl: string;
    aiHint: string;
}

export interface RegisterPageConfig {
    imageUrl: string;
    aiHint: string;
}

export interface SocialLink {
    id: string; // Added for stable key
    name: string;
    url: string;
    iconType: 'icon' | 'image';
    iconName?: string;
    iconImageUrl?: string;
    icon: LucideIcon;
}

export interface DeveloperInfo {
    name: string;
    title: string;
    avatarUrl: string;
    bio: string;
    socialLinks: SocialLink[];
}

export interface SessionConfig {
    durationMinutes: number;
}

export interface AboutInfo {
  appName: string;
  version: string;
  description: string;
  features: string[];
}

export interface PromoPopupConfig {
  enabled: boolean;
  imageUrl: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  promoVersion?: number;
}

export interface Role {
  id: string;
  name: string;
}

export interface SmwManyarConfig {
    sisaIkanItems: ReportItem[];
    terjualItems: ReportItem[];
    onlineSalesItems: ReportItem[];
}

export interface TeamMember {
    id: number;
    name: string;
    title: string;
    avatarUrl: string;
    avatarFallback: string;
}

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

export interface ContactMethod {
    id: string;
    icon: LucideIcon;
    iconName: string;
    title: string;
    value: string;
    action: string;
    actionLabel: string;
}

export interface SupportPageConfig {
    faqItems: FaqItem[];
    contactMethods: ContactMethod[];
}


// --- Firestore Document References ---
const menuConfigDocRef = doc(db, 'app-settings', 'menu-grid');
const sidebarMenuConfigDocRef = doc(db, 'app-settings', 'sidebar-menu');
const adminSidebarMenuConfigDocRef = doc(db, 'app-settings', 'admin-sidebar-menu');
const bannerConfigDocRef = doc(db, 'app-settings', 'banner-slides');
const brandingConfigDocRef = doc(db, 'app-settings', 'branding');
const loginPageConfigDocRef = doc(db, 'app-settings', 'login-page');
const registerPageConfigDocRef = doc(db, 'app-settings', 'register-page');
const developerInfoDocRef = doc(db, 'app-settings', 'developer-info');
const sessionConfigDocRef = doc(db, 'app-settings', 'sessionConfig');
const aboutInfoDocRef = doc(db, 'app-settings', 'aboutInfo');
const promoPopupConfigDocRef = doc(db, 'app-settings', 'promo-popup');
const defaultUserGroupDocRef = doc(db, 'app-settings', 'defaultUserGroup');
const rolesDocRef = doc(db, 'app-settings', 'userRoles');
const smwManyarConfigDocRef = doc(db, 'app-settings', 'smwManyarConfig');
const teamMembersDocRef = doc(db, 'app-settings', 'teamMembers');
const supportConfigDocRef = doc(db, 'app-settings', 'supportPageConfig');


// --- Default Data ---
const defaultSidebarItems: MenuItem[] = [homeMenuItem, ...defaultAllMenuItems];

const defaultBannerSlides: BannerSlide[] = [
  {
    id: 1,
    title: 'Solusi Inovatif',
    description: 'Tingkatkan produktivitas bisnis Anda dengan alat canggih kami.',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvbW90aW9uYWwlMjBiYW5uZXJ8ZW58MHx8fHwxNzU1NTUwMzk2fDA',
    hint: 'promotional banner',
    visible: true,
    url: '/',
  },
  {
    id: 2,
    title: 'Analitik Cerdas',
    description: 'Dapatkan wawasan mendalam dari data Anda dengan dasbor interaktif.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGF0YSUyMGFuYWx5dGljc3xlbnwwfHx8fDE3NTU1NTAzOTZ8MA',
    hint: 'data analytics',
    visible: true,
    url: '/analytics',
  },
  {
    id: 3,
    title: 'Asisten AI Nexus',
    description: 'Biarkan AI membantu Anda menyelesaikan tugas lebih cepat dan efisien.',
    image: 'https://images.unsplash.com/photo-1620712943543-285f716a8ae6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXJ0aWZpY2lhbCUyMGludGVsbGlnZW5jZXxlbnwwfHx8fDE3NTU1NTAzOTV8MA',
    hint: 'artificial intelligence',
    visible: true,
    url: '/ai-assistant',
  }
];

const defaultBrandingConfig: BrandingConfig = {
  appName: 'Adelia-ID',
  logoType: 'icon',
  icon: Logo,
  iconName: 'Logo',
  imageUrl: '',
  footerText: '© 2025 Adelia-ID | Enterprise Business Solution'
};

const defaultLoginPageConfig: LoginPageConfig = {
    imageUrl: 'https://images.unsplash.com/photo-1588590396420-55b01a8511a1?q=80&w=1887&auto=format&fit=crop',
    aiHint: 'security lock',
};

const defaultRegisterPageConfig: RegisterPageConfig = {
    imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1887&auto=format&fit=crop',
    aiHint: 'team working',
};


const defaultDeveloperInfo: DeveloperInfo = {
  name: 'Agus Eka',
  title: 'Full-Stack Developer & UI/UX Enthusiast',
  avatarUrl: 'https://placehold.co/150x150.png',
  bio: 'Saya adalah seorang pengembang perangkat lunak dengan hasrat untuk menciptakan solusi teknologi yang inovatif dan aplikasi yang ramah pengguna. Berkomitmen pada pembelajaran berkelanjutan dan keunggulan dalam pengembangan.',
  socialLinks: [
    { id: 'dev-link-1', name: 'GitHub', url: 'https://github.com/aguseka', iconType: 'icon', iconName: 'Github', icon: getIconComponent('Github') },
    { id: 'dev-link-2', name: 'LinkedIn', url: 'https://linkedin.com/in/aguseka', iconType: 'icon', iconName: 'Linkedin', icon: getIconComponent('Linkedin') },
    { id: 'dev-link-3', name: 'Website', url: 'https://aguseka.dev', iconType: 'icon', iconName: 'Globe', icon: getIconComponent('Globe') },
    { id: 'dev-link-4', name: 'Email', url: 'mailto:contact@aguseka.dev', iconType: 'icon', iconName: 'Mail', icon: getIconComponent('Mail') },
  ],
};

const defaultSessionConfig: SessionConfig = {
  durationMinutes: 120, // Default to 2 hours
};

const defaultAboutInfo: AboutInfo = {
  appName: 'Adelia-ID',
  version: '1.0.0',
  description: 'Solusi bisnis inovatif untuk meningkatkan efisiensi dan produktivitas.',
  features: [
    'Manajemen Laporan Harian',
    'Penjualan Produk Digital',
    'Manajemen Stok',
    'Asisten AI Cerdas',
    'Utilitas Bermanfaat'
  ]
};

const defaultPromoPopupConfig: PromoPopupConfig = {
  enabled: false,
  imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1974&auto=format&fit=crop',
  title: 'Pengumuman',
  description: 'Konten pengumuman atau promosi akan ditampilkan di sini. Anda dapat mengubahnya di panel admin.',
  buttonText: 'Lihat Detail',
  buttonLink: '/',
  promoVersion: 1,
};

const defaultRoles: Role[] = [
    { id: 'admin', name: 'Admin' },
    { id: 'pengguna', name: 'Pengguna' },
    { id: 'editor', name: 'Editor' },
    { id: 'khusus', name: 'Khusus' },
];

const defaultSmwManyarConfig: SmwManyarConfig = {
    sisaIkanItems: [
        { id: 'daging', label: 'DAGING' }, { id: 'babat', label: 'BABAT' }, { id: 'paru', label: 'PARU' },
        { id: 'usus', label: 'USUS' }, { id: 'ati', label: 'ATI' }, { id: 'otak', label: 'OTAK' },
        { id: 'telur', label: 'TELUR' }, { id: 'kuah', label: 'KUAH' }, { id: 'bgoreng', label: 'B•GORENG' },
        { id: 'seledri', label: 'SELEDRI' }, { id: 'garam', label: 'GARAM' },
    ],
    terjualItems: [
        { id: 'babat', label: 'Babat' }, { id: 'babat-telur', label: 'Babat Telur' }, { id: 'biasa', label: 'Biasa' },
        { id: 'biasa-telur', label: 'Biasa Telur' }, { id: 'daging', label: 'Daging' }, { id: 'daging-telur', label: 'Daging Telur' },
        { id: 'daging-double-t', label: 'Daging Double T' }, { id: 'istimewa', label: 'Istimewa' }, { id: 'ati-otak', label: 'Ati Otak' },
        { id: 'ati-otak-telur', label: 'Ati Otak Telur' }, { id: 'telur-kuah', label: 'Telur Kuah' }, { id: 'telur', label: 'Telur' }, { id: 'nasi', label: 'Nasi' },
    ],
    onlineSalesItems: [
        { id: 'go-food', label: 'GoFood' }, { id: 'grab-food', label: 'GrabFood' }, { id: 'cash', label: 'Cash/Dll' },
    ],
};

const defaultTeamMembers: TeamMember[] = [
  { id: 1, name: 'Adelia', title: 'Project Manager', avatarUrl: 'https://placehold.co/150x150.png', avatarFallback: 'AD' },
  { id: 2, name: 'Budi', title: 'Lead Developer', avatarUrl: 'https://placehold.co/150x150.png', avatarFallback: 'BU' },
  { id: 3, name: 'Citra', title: 'UI/UX Designer', avatarUrl: 'https://placehold.co/150x150.png', avatarFallback: 'CI' },
  { id: 4, name: 'Dewi', title: 'QA Engineer', avatarUrl: 'https://placehold.co/150x150.png', avatarFallback: 'DE' },
];

const defaultSupportConfig: SupportPageConfig = {
  faqItems: [
    { id: 'faq-1', question: "Bagaimana cara mengubah kata sandi saya?", answer: "Anda dapat mengubah kata sandi Anda dengan membuka halaman 'Profil' dari menu dropdown pengguna di kanan atas. Di sana, Anda akan menemukan bagian 'Ubah Kata Sandi'. Masukkan kata sandi Anda saat ini dan kata sandi baru untuk memperbaruinya." },
    { id: 'faq-2', question: "Apa yang harus dilakukan jika saya lupa kata sandi?", answer: "Jika Anda lupa kata sandi, silakan hubungi administrator sistem Anda secara langsung. Saat ini, fitur pemulihan kata sandi mandiri belum tersedia dan memerlukan bantuan admin untuk mereset akun Anda." },
    { id: 'faq-3', question: "Untuk apa halaman 'Laporan Harian' digunakan?", answer: "Halaman 'Laporan Harian' digunakan untuk mencatat dan mengirimkan laporan keuangan harian Anda dengan mudah. Anda bisa memasukkan data seperti omset, pengeluaran, dan pemasukan online, lalu mengirimkannya via WhatsApp atau menyimpannya." },
    { id: 'faq-4', question: "Bagaimana cara menggunakan fitur 'Cek Usia'?", answer: "Cukup masukkan tanggal, bulan, dan tahun lahir Anda pada kolom yang tersedia di halaman 'Cek Usia', lalu klik tombol 'Hitung Usia'. Aplikasi akan secara otomatis menampilkan usia akurat Anda, zodiak, shio, dan informasi menarik lainnya." }
  ],
  contactMethods: [
    { id: 'contact-1', iconName: 'Mail', icon: getIconComponent('Mail'), title: "Email", value: "support@adelia-id.com", action: "mailto:support@adelia-id.com", actionLabel: "Kirim Email" },
    { id: 'contact-2', iconName: 'MessageSquare', icon: getIconComponent('MessageSquare'), title: "WhatsApp", value: "+62 812 3456 7891", action: "https://wa.me/6281234567891", actionLabel: "Chat via WA" }
  ]
};


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
            isUnderMaintenance: item.isUnderMaintenance ?? false,
            requiresAuth: item.requiresAuth ?? false,
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
    iconName: item.iconName || (item.icon && (item.icon as any).displayName) || 'Package',
    access: item.access || 'all',
    comingSoon: item.comingSoon || false,
    badgeText: item.badgeText || '',
    isUnderMaintenance: item.isUnderMaintenance || false,
    requiresAuth: item.requiresAuth || false,
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
    iconName: item.iconName || (item.icon && (item.icon as any).displayName) || 'Package',
    access: item.access || 'all',
    comingSoon: item.comingSoon || false,
    badgeText: item.badgeText || '',
    isUnderMaintenance: item.isUnderMaintenance || false,
    requiresAuth: item.requiresAuth || false,
  }));
  await setDoc(sidebarMenuConfigDocRef, { items: itemsToStore });
};

// --- Admin Sidebar Menu Store ---
interface AdminSidebarMenuStoreState {
  adminSidebarMenuItems: MenuItem[];
  isLoading: boolean;
  error: Error | null;
  initializeListener: () => () => void;
}

const useAdminSidebarMenuStore = create<AdminSidebarMenuStoreState>((set) => ({
  adminSidebarMenuItems: [],
  isLoading: true,
  error: null,
  initializeListener: () => {
    const unsubscribe = onSnapshot(
      adminSidebarMenuConfigDocRef,
      (docSnap) => {
        if (docSnap.exists() && docSnap.data()?.items) {
          const storedItems = docSnap.data()?.items as MenuItemDTO[];
          const hydratedItems = storedItems.map((item) => ({
            ...item,
            icon: getIconComponent(item.iconName),
          }));
          set({ adminSidebarMenuItems: hydratedItems, isLoading: false, error: null });
        } else {
          set({ adminSidebarMenuItems: defaultAdminMenuItems, isLoading: false, error: null });
        }
      },
      (error) => {
         console.error("Error fetching admin sidebar menu config: ", error);
        set({ adminSidebarMenuItems: defaultAdminMenuItems, isLoading: false, error });
      }
    );
    return unsubscribe;
  },
}));

export const useAdminSidebarMenuConfig = () => {
  const { adminSidebarMenuItems, isLoading, initializeListener } = useAdminSidebarMenuStore();
  React.useEffect(() => {
    const unsubscribe = initializeListener();
    return () => unsubscribe();
  }, [initializeListener]);
  return { adminSidebarMenuItems, isLoading };
};

export const saveAdminSidebarMenuConfig = async (items: MenuItem[]) => {
  const itemsToStore = items.map((item) => {
    const { icon, ...rest } = item;
    return {
      ...rest,
      id: item.id,
      title: item.title,
      href: item.href,
      iconName: item.iconName || 'Package',
      access: 'admin',
    };
  });
  await setDoc(adminSidebarMenuConfigDocRef, { items: itemsToStore });
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
        url: slide.url || '',
    }));
    await setDoc(bannerConfigDocRef, { slides: slidesToStore });
}

// --- Branding Config Store ---
interface BrandingStoreState {
  brandingConfig: BrandingConfig;
  isLoading: boolean;
  error: Error | null;
  initializeListener: () => () => void;
}

const useBrandingStore = create<BrandingStoreState>((set) => ({
    brandingConfig: defaultBrandingConfig,
    isLoading: true,
    error: null,
    initializeListener: () => {
        const unsubscribe = onSnapshot(brandingConfigDocRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data()) {
                const dto = docSnap.data() as BrandingConfigDTO;
                const hydratedConfig: BrandingConfig = {
                    appName: dto.appName,
                    logoType: dto.logoType,
                    icon: getIconComponent(dto.iconName),
                    iconName: dto.iconName,
                    imageUrl: dto.imageUrl,
                    footerText: dto.footerText
                };
                set({ brandingConfig: hydratedConfig, isLoading: false, error: null });
            } else {
                set({ brandingConfig: defaultBrandingConfig, isLoading: false, error: null });
            }
        }, (error) => {
            console.error("Error fetching branding config: ", error);
            set({ brandingConfig: defaultBrandingConfig, isLoading: false, error });
        });
        return unsubscribe;
    }
}));

export const useBrandingConfig = () => {
    const { brandingConfig, isLoading, initializeListener } = useBrandingStore();
    React.useEffect(() => {
        const unsubscribe = initializeListener();
        return () => unsubscribe();
    }, [initializeListener]);
    return { brandingConfig, isLoading };
};

export const saveBrandingConfig = async (config: BrandingConfig) => {
    const configToStore: BrandingConfigDTO = {
        appName: config.appName,
        logoType: config.logoType,
        iconName: config.iconName,
        imageUrl: config.imageUrl,
        footerText: config.footerText,
    };
    await setDoc(brandingConfigDocRef, configToStore);
};

// --- Login Page Config Store ---
interface LoginPageStoreState {
  loginPageConfig: LoginPageConfig;
  isLoading: boolean;
  error: Error | null;
  initializeListener: () => () => void;
}

const useLoginPageStore = create<LoginPageStoreState>((set) => ({
    loginPageConfig: defaultLoginPageConfig,
    isLoading: true,
    error: null,
    initializeListener: () => {
        const unsubscribe = onSnapshot(loginPageConfigDocRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data()) {
                set({ loginPageConfig: docSnap.data() as LoginPageConfig, isLoading: false, error: null });
            } else {
                set({ loginPageConfig: defaultLoginPageConfig, isLoading: false, error: null });
            }
        }, (error) => {
            console.error("Error fetching login page config:", error);
            set({ loginPageConfig: defaultLoginPageConfig, isLoading: false, error });
        });
        return unsubscribe;
    }
}));

export const useLoginPageConfig = () => {
    const { loginPageConfig, isLoading, initializeListener } = useLoginPageStore();
    React.useEffect(() => {
        const unsubscribe = initializeListener();
        return () => unsubscribe();
    }, [initializeListener]);
    return { loginPageConfig, isLoading };
};

export const saveLoginPageConfig = async (config: LoginPageConfig) => {
    const configToStore: LoginPageConfigDTO = {
        imageUrl: config.imageUrl,
        aiHint: config.aiHint,
    };
    await setDoc(loginPageConfigDocRef, configToStore);
};

// --- Register Page Config Store ---
interface RegisterPageStoreState {
  registerPageConfig: RegisterPageConfig;
  isLoading: boolean;
  error: Error | null;
  initializeListener: () => () => void;
}

const useRegisterPageStore = create<RegisterPageStoreState>((set) => ({
    registerPageConfig: defaultRegisterPageConfig,
    isLoading: true,
    error: null,
    initializeListener: () => {
        const unsubscribe = onSnapshot(registerPageConfigDocRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data()) {
                set({ registerPageConfig: docSnap.data() as RegisterPageConfig, isLoading: false, error: null });
            } else {
                set({ registerPageConfig: defaultRegisterPageConfig, isLoading: false, error: null });
            }
        }, (error) => {
            console.error("Error fetching register page config:", error);
            set({ registerPageConfig: defaultRegisterPageConfig, isLoading: false, error });
        });
        return unsubscribe;
    }
}));

export const useRegisterPageConfig = () => {
    const { registerPageConfig, isLoading, initializeListener } = useRegisterPageStore();
    React.useEffect(() => {
        const unsubscribe = initializeListener();
        return () => unsubscribe();
    }, [initializeListener]);
    return { registerPageConfig, isLoading };
};

export const saveRegisterPageConfig = async (config: RegisterPageConfig) => {
    const configToStore: RegisterPageConfigDTO = {
        imageUrl: config.imageUrl,
        aiHint: config.aiHint,
    };
    await setDoc(registerPageConfigDocRef, configToStore);
};


// --- Developer Info Store ---
interface DeveloperInfoState {
  developerInfo: DeveloperInfo;
  isLoading: boolean;
  error: Error | null;
  initializeListener: () => () => void;
}

const useDeveloperInfoStore = create<DeveloperInfoState>((set) => ({
    developerInfo: defaultDeveloperInfo,
    isLoading: true,
    error: null,
    initializeListener: () => {
        const unsubscribe = onSnapshot(developerInfoDocRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data()) {
                const dto = docSnap.data() as DeveloperInfoDTO;
                const hydratedInfo: DeveloperInfo = {
                    ...dto,
                    socialLinks: (dto.socialLinks || []).map(link => ({
                        ...link,
                        id: link.id || `link-${Math.random()}`, // Ensure ID exists for key prop
                        iconType: link.iconType || 'icon',
                        icon: getIconComponent(link.iconName),
                    })),
                };
                set({ developerInfo: hydratedInfo, isLoading: false, error: null });
            } else {
                set({ developerInfo: defaultDeveloperInfo, isLoading: false, error: null });
            }
        }, (error) => {
            console.error("Error fetching developer info: ", error);
            set({ developerInfo: defaultDeveloperInfo, isLoading: false, error });
        });
        return unsubscribe;
    }
}));

export const useDeveloperInfoConfig = () => {
    const { developerInfo, isLoading, initializeListener } = useDeveloperInfoStore();
    React.useEffect(() => {
        const unsubscribe = initializeListener();
        return () => unsubscribe();
    }, [initializeListener]);
    return { developerInfo, isLoading };
};

export const saveDeveloperInfoConfig = async (info: DeveloperInfo) => {
    const infoToStore: DeveloperInfoDTO = {
        name: info.name,
        title: info.title,
        avatarUrl: info.avatarUrl,
        bio: info.bio,
        socialLinks: info.socialLinks.map(link => ({
            id: link.id,
            name: link.name,
            url: link.url,
            iconType: link.iconType,
            iconName: link.iconName,
            iconImageUrl: link.iconImageUrl,
        })),
    };
    await setDoc(developerInfoDocRef, infoToStore);
};

// --- Session Config Store ---
interface SessionConfigState {
  sessionConfig: SessionConfig;
  isLoading: boolean;
  error: Error | null;
  initializeListener: () => () => void;
}

const useSessionConfigStore = create<SessionConfigState>((set) => ({
    sessionConfig: defaultSessionConfig,
    isLoading: true,
    error: null,
    initializeListener: () => {
        const unsubscribe = onSnapshot(sessionConfigDocRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data()) {
                set({ sessionConfig: docSnap.data() as SessionConfig, isLoading: false, error: null });
            } else {
                set({ sessionConfig: defaultSessionConfig, isLoading: false, error: null });
            }
        }, (error) => {
            console.error("Error fetching session config: ", error);
            set({ sessionConfig: defaultSessionConfig, isLoading: false, error });
        });
        return unsubscribe;
    }
}));

export const useSessionConfig = () => {
    const { sessionConfig, isLoading, initializeListener } = useSessionConfigStore();
    React.useEffect(() => {
        const unsubscribe = initializeListener();
        return () => unsubscribe();
    }, [initializeListener]);
    return { sessionConfig, isLoading };
};

export const saveSessionConfig = async (config: SessionConfig) => {
    const configToStore: SessionConfigDTO = {
        durationMinutes: config.durationMinutes,
    };
    await setDoc(sessionConfigDocRef, configToStore);
};

// --- About Info Store ---
interface AboutInfoState {
  aboutInfo: AboutInfo;
  isLoading: boolean;
  error: Error | null;
  initializeListener: () => () => void;
}

const useAboutInfoStore = create<AboutInfoState>((set) => ({
  aboutInfo: defaultAboutInfo,
  isLoading: true,
  error: null,
  initializeListener: () => {
    const unsubscribe = onSnapshot(
      aboutInfoDocRef,
      (docSnap) => {
        if (docSnap.exists() && docSnap.data()) {
          set({ aboutInfo: docSnap.data() as AboutInfo, isLoading: false, error: null });
        } else {
          set({ aboutInfo: defaultAboutInfo, isLoading: false, error: null });
        }
      },
      (error) => {
        console.error("Error fetching about info: ", error);
        set({ aboutInfo: defaultAboutInfo, isLoading: false, error });
      }
    );
    return unsubscribe;
  },
}));

export const useAboutInfoConfig = () => {
  const { aboutInfo, isLoading, initializeListener } = useAboutInfoStore();
  React.useEffect(() => {
    const unsubscribe = initializeListener();
    return () => unsubscribe();
  }, [initializeListener]);
  return { aboutInfo, isLoading };
};

export const saveAboutInfoConfig = async (info: AboutInfo) => {
  await setDoc(aboutInfoDocRef, info);
};

// --- Promo Popup Config Store ---
interface PromoPopupState {
  promoPopupConfig: PromoPopupConfig;
  isLoading: boolean;
  error: Error | null;
  initializeListener: () => () => void;
}

const usePromoPopupStore = create<PromoPopupState>((set) => ({
  promoPopupConfig: defaultPromoPopupConfig,
  isLoading: true,
  error: null,
  initializeListener: () => {
    const unsubscribe = onSnapshot(
      promoPopupConfigDocRef,
      (docSnap) => {
        if (docSnap.exists() && docSnap.data()) {
          set({ promoPopupConfig: docSnap.data() as PromoPopupConfig, isLoading: false, error: null });
        } else {
          set({ promoPopupConfig: defaultPromoPopupConfig, isLoading: false, error: null });
        }
      },
      (error) => {
        console.error("Error fetching promo popup config: ", error);
        set({ promoPopupConfig: defaultPromoPopupConfig, isLoading: false, error });
      }
    );
    return unsubscribe;
  },
}));

export const usePromoPopupConfig = () => {
  const { promoPopupConfig, isLoading, initializeListener } = usePromoPopupStore();
  React.useEffect(() => {
    const unsubscribe = initializeListener();
    return () => unsubscribe();
  }, [initializeListener]);
  return { promoPopupConfig, isLoading };
};

export const savePromoPopupConfig = async (config: PromoPopupConfig) => {
  const configToStore: PromoPopupConfigDTO = {
    ...config,
  };
  await setDoc(promoPopupConfigDocRef, configToStore);
};


// --- Default User Group Store ---
interface DefaultUserGroupState {
  defaultUserGroupId: string | null;
  isLoading: boolean;
  initializeListener: () => () => void;
}

const useDefaultUserGroupStore = create<DefaultUserGroupState>((set) => ({
  defaultUserGroupId: null,
  isLoading: true,
  initializeListener: () => {
    const unsubscribe = onSnapshot(defaultUserGroupDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data()?.groupId) {
        set({ defaultUserGroupId: docSnap.data()?.groupId, isLoading: false });
      } else {
        set({ defaultUserGroupId: null, isLoading: false });
      }
    }, (error) => {
      console.error("Error fetching default user group:", error);
      set({ isLoading: false });
    });
    return unsubscribe;
  }
}));

export const useDefaultUserGroupConfig = () => {
  const { defaultUserGroupId, isLoading, initializeListener } = useDefaultUserGroupStore();
  React.useEffect(() => {
    const unsubscribe = initializeListener();
    return () => unsubscribe();
  }, [initializeListener]);
  return { defaultUserGroupId, isLoading };
};

export const saveDefaultUserGroupConfig = async (groupId: string) => {
  await setDoc(defaultUserGroupDocRef, { groupId });
};

// --- Roles Store ---
interface RolesState {
  roles: Role[];
  isLoading: boolean;
  error: Error | null;
  initializeListener: () => () => void;
}

const useRolesStore = create<RolesState>((set) => ({
  roles: defaultRoles,
  isLoading: true,
  error: null,
  initializeListener: () => {
    const unsubscribe = onSnapshot(
      rolesDocRef,
      (docSnap) => {
        if (docSnap.exists() && docSnap.data()?.roles) {
          set({ roles: docSnap.data()?.roles as Role[], isLoading: false, error: null });
        } else {
          set({ roles: defaultRoles, isLoading: false, error: null });
        }
      },
      (error) => {
        console.error("Error fetching roles: ", error);
        set({ roles: defaultRoles, isLoading: false, error });
      }
    );
    return unsubscribe;
  },
}));

export const useRolesConfig = () => {
  const { roles, isLoading, initializeListener } = useRolesStore();
  React.useEffect(() => {
    const unsubscribe = initializeListener();
    return () => unsubscribe();
  }, [initializeListener]);
  return { roles, isLoading };
};

export const saveRolesConfig = async (roles: Role[]) => {
  await setDoc(rolesDocRef, { roles });
};

// --- SMW Manyar Config Store ---
interface SmwManyarConfigState {
  smwManyarConfig: SmwManyarConfig;
  isLoading: boolean;
  error: Error | null;
  initializeListener: () => () => void;
}

const useSmwManyarConfigStore = create<SmwManyarConfigState>((set) => ({
    smwManyarConfig: defaultSmwManyarConfig,
    isLoading: true,
    error: null,
    initializeListener: () => {
        const unsubscribe = onSnapshot(smwManyarConfigDocRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data()) {
                set({ smwManyarConfig: docSnap.data() as SmwManyarConfig, isLoading: false, error: null });
            } else {
                set({ smwManyarConfig: defaultSmwManyarConfig, isLoading: false, error: null });
            }
        }, (error) => {
            console.error("Error fetching SMW Manyar config:", error);
            set({ smwManyarConfig: defaultSmwManyarConfig, isLoading: false, error });
        });
        return unsubscribe;
    }
}));

export const useSmwManyarConfig = () => {
    const { smwManyarConfig, isLoading, initializeListener } = useSmwManyarConfigStore();
    React.useEffect(() => {
        const unsubscribe = initializeListener();
        return () => unsubscribe();
    }, [initializeListener]);
    return { smwManyarConfig, isLoading };
};

export const saveSmwManyarConfig = async (config: SmwManyarConfig) => {
    const configToStore: SmwManyarConfigDTO = {
        sisaIkanItems: config.sisaIkanItems,
        terjualItems: config.terjualItems,
        onlineSalesItems: config.onlineSalesItems,
    };
    await setDoc(smwManyarConfigDocRef, configToStore);
};

// --- Team Members Store ---
interface TeamStoreState {
  teamMembers: TeamMember[];
  isLoading: boolean;
  error: Error | null;
  initializeListener: () => () => void;
}

const useTeamStore = create<TeamStoreState>((set) => ({
  teamMembers: [],
  isLoading: true,
  error: null,
  initializeListener: () => {
    const unsubscribe = onSnapshot(teamMembersDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data()?.members) {
        set({ teamMembers: docSnap.data().members as TeamMember[], isLoading: false, error: null });
      } else {
        set({ teamMembers: defaultTeamMembers, isLoading: false, error: null });
      }
    }, (error) => {
      console.error("Error fetching team members:", error);
      set({ teamMembers: defaultTeamMembers, isLoading: false, error });
    });
    return unsubscribe;
  }
}));

export const useTeamConfig = () => {
  const { teamMembers, isLoading, initializeListener } = useTeamStore();
  React.useEffect(() => {
    const unsubscribe = initializeListener();
    return () => unsubscribe();
  }, [initializeListener]);
  return { teamMembers, isLoading };
};

export const saveTeamConfig = async (members: TeamMember[]) => {
  const membersToStore: TeamMemberDTO[] = members.map(member => ({
    id: member.id,
    name: member.name,
    title: member.title,
    avatarUrl: member.avatarUrl,
    avatarFallback: member.avatarFallback,
  }));
  await setDoc(teamMembersDocRef, { members: membersToStore });
};

// --- Support Page Config Store ---
interface SupportPageStoreState {
  supportConfig: SupportPageConfig;
  isLoading: boolean;
  error: Error | null;
  initializeListener: () => () => void;
}

const useSupportPageStore = create<SupportPageStoreState>((set) => ({
  supportConfig: defaultSupportConfig,
  isLoading: true,
  error: null,
  initializeListener: () => {
    const unsubscribe = onSnapshot(supportConfigDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data()) {
        const dto = docSnap.data() as SupportPageConfigDTO;
        const hydratedConfig: SupportPageConfig = {
          faqItems: dto.faqItems || [],
          contactMethods: (dto.contactMethods || []).map(method => ({
            id: method.id,
            icon: getIconComponent(method.iconName),
            iconName: method.iconName,
            title: method.title,
            value: method.value,
            action: method.action,
            actionLabel: method.actionLabel,
          })),
        };
        set({ supportConfig: hydratedConfig, isLoading: false, error: null });
      } else {
        set({ supportConfig: defaultSupportConfig, isLoading: false, error: null });
      }
    }, (error) => {
      console.error("Error fetching support page config:", error);
      set({ supportConfig: defaultSupportConfig, isLoading: false, error });
    });
    return unsubscribe;
  }
}));

export const useSupportPageConfig = () => {
  const { supportConfig, isLoading, initializeListener } = useSupportPageStore();
  React.useEffect(() => {
    const unsubscribe = initializeListener();
    return () => unsubscribe();
  }, [initializeListener]);
  return { supportConfig, isLoading };
};

export const saveSupportPageConfig = async (config: SupportPageConfig) => {
  const configToStore: SupportPageConfigDTO = {
    faqItems: config.faqItems.map(item => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
    })),
    contactMethods: config.contactMethods.map(method => ({
      id: method.id,
      iconName: method.iconName,
      title: method.title,
      value: method.value,
      action: method.action,
      actionLabel: method.actionLabel,
    })),
  };
  await setDoc(supportConfigDocRef, configToStore);
};

    

