import {
  Users,
  LayoutGrid,
  Settings2,
  Bot,
  BarChart,
  Settings,
  FileText,
  LifeBuoy,
  User,
  Home,
  type LucideIcon,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
  access: 'all' | 'admin';
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
    title: 'Bantuan &amp; Dukungan',
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

export const allMenuItems: MenuItem[] = [homeMenuItem, ...menuItems];
