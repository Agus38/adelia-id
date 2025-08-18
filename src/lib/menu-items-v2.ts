import {
  MessageSquare,
  Package,
  Calculator,
  Send,
  Bot,
  Cake,
  Repeat,
  Tag,
  Archive,
  Home,
  type LucideIcon,
  Users,
  LayoutGrid,
  Settings2,
  BarChart,
  Settings,
  FileText,
  LifeBuoy,
  User,
  Shield,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  access?: 'all' | 'admin';
  comingSoon?: boolean;
}

export const homeMenuItem: MenuItem = {
  id: 'home',
  title: 'Beranda',
  href: '/',
  icon: Home,
  description: 'Kembali ke halaman utama.',
  access: 'all',
}

export const menuItems: MenuItem[] = [
  {
    id: 'wa-sender',
    title: 'WA SENDER',
    href: '/wa-sender',
    icon: MessageSquare,
  },
  {
    id: 'stok-produk',
    title: 'STOK PRODUK',
    href: '/stok-produk',
    icon: Package,
  },
  {
    id: 'coming-soon',
    title: '',
    href: '#',
    icon: Calculator,
    comingSoon: true,
  },
  {
    id: 'wa-smw',
    title: 'WA-SMW',
    href: '/wa-smw',
    icon: Send,
  },
  {
    id: 'nexus-ai',
    title: 'NEXUS-AI',
    href: '/ai-assistant',
    icon: Bot,
  },
  {
    id: 'cek-usia',
    title: 'CEK USIA',
    href: '/cek-usia',
    icon: Cake,
  },
  {
    id: 'convert',
    title: 'CONVERT',
    href: '/convert',
    icon: Repeat,
  },
  {
    id: 'diskon',
    title: 'DISKON',
    href: '/diskon',
    icon: Tag,
  },
  {
    id: 'stok-manyar',
    title: 'STOK MANYAR',
    href: '/stok-manyar',
    icon: Archive,
  },
  {
    id: 'admin-panel',
    title: 'PANEL ADMIN',
    href: '/admin',
    icon: Shield,
    access: 'admin',
  },
];

export const adminMenuItems: MenuItem[] = [
  {
    id: 'user-management',
    title: 'Manajemen Pengguna',
    href: '/admin/users',
    icon: Users,
    description: 'Kelola pengguna, peran, dan hak akses.',
    access: 'admin',
  },
  {
    id: 'menu-management',
    title: 'Manajemen Menu',
    href: '/admin/menus',
    icon: LayoutGrid,
    description: 'Sesuaikan item menu, ikon, dan visibilitas.',
    access: 'admin',
  },
  {
    id: 'setup',
    title: 'Pengaturan',
    href: '/admin/setup',
    icon: Settings2,
    description: 'Tutorial integrasi dan konfigurasi sistem.',
    access: 'admin',
  },
];


export const allMenuItems: MenuItem[] = [
  homeMenuItem,
  {
    id: 'ai-assistant',
    title: 'Asisten AI Nexus',
    href: '/ai-assistant',
    icon: Bot,
    description: 'Bantuan cerdas untuk tugas Anda.',
    access: 'all',
  },
  {
    id: 'analytics',
    title: 'Analitik',
    href: '/analytics',
    icon: BarChart,
    description: 'Lihat dasbor dan laporan analitik.',
    access: 'all',
  },
  {
    id: 'app-settings',
    title: 'Pengaturan Aplikasi',
    href: '/settings',
    icon: Settings,
    description: 'Konfigurasi pengaturan aplikasi umum.',
    access: 'all',
  },
  {
    id: 'reports',
    title: 'Laporan',
    href: '/reports',
    icon: FileText,
    description: 'Hasilkan dan lihat laporan sistem.',
    access: 'all',
  },
  {
    id: 'support',
    title: 'Bantuan & Dukungan',
    href: '/support',
    icon: LifeBuoy,
    description: 'Hubungi dukungan atau lihat FAQ.',
    access: 'all',
  },
  {
    id: 'profile',
    title: 'Profil',
    href: '/profile',
    icon: User,
    description: 'Kelola detail profil pribadi Anda.',
    access: 'all',
  },
];
