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
  ImageIcon,
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
    title: 'MENU 1',
    href: '/wa-sender',
    icon: MessageSquare,
  },
  {
    id: 'stok-produk',
    title: 'MENU 2',
    href: '/stok-produk',
    icon: Package,
  },
  {
    id: 'coming-soon',
    title: 'MENU 3',
    href: '#',
    icon: Calculator,
  },
  {
    id: 'wa-smw',
    title: 'MENU 4',
    href: '/wa-smw',
    icon: Send,
  },
  {
    id: 'nexus-ai',
    title: 'MENU 5',
    href: '/ai-assistant',
    icon: Bot,
  },
  {
    id: 'cek-usia',
    title: 'MENU 6',
    href: '/cek-usia',
    icon: Cake,
  },
  {
    id: 'convert',
    title: 'MENU 7',
    href: '/convert',
    icon: Repeat,
  },
  {
    id: 'diskon',
    title: 'MENU 8',
    href: '/diskon',
    icon: Tag,
  },
  {
    id: 'stok-manyar',
    title: 'MENU 9',
    href: '/stok-manyar',
    icon: Archive,
  },
];

export const adminMenuItems: MenuItem[] = [
  {
    id: 'admin-dashboard',
    title: 'Dasbor Admin',
    href: '/admin',
    icon: LayoutGrid,
    description: 'Tampilan ringkasan dan manajemen sistem.',
    access: 'admin',
  },
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
    icon: Settings,
    description: 'Sesuaikan item menu, ikon, dan visibilitas.',
    access: 'admin',
  },
    {
    id: 'banner-management',
    title: 'Manajemen Banner',
    href: '/admin/banner',
    icon: ImageIcon,
    description: 'Kelola banner dan slide di halaman utama.',
    access: 'admin',
  },
  {
    id: 'system-settings',
    title: 'Pengaturan Sistem',
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
  {
    id: 'admin-panel',
    title: 'Panel Admin',
    href: '/admin',
    icon: Shield,
    access: 'admin',
  },
];
