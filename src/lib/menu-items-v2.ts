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
    title: 'Laporan Harian',
    href: '/wa-sender',
    icon: MessageSquare,
  },
  {
    id: 'stok-produk',
    title: 'Stok Produk',
    href: '/stok-produk',
    icon: Package,
    comingSoon: true,
  },
  {
    id: 'kalkulator',
    title: 'Kalkulator',
    href: '/kalkulator',
    icon: Calculator,
    comingSoon: true,
  },
  {
    id: 'wa-smw',
    title: 'WA SMW',
    href: '/wa-smw',
    icon: Send,
    comingSoon: true,
  },
  {
    id: 'nexus-ai',
    title: 'Nexus AI',
    href: '/ai-assistant',
    icon: Bot,
  },
  {
    id: 'cek-usia',
    title: 'Cek Usia',
    href: '/cek-usia',
    icon: Cake,
    comingSoon: true,
  },
  {
    id: 'convert',
    title: 'Konversi',
    href: '/convert',
    icon: Repeat,
    comingSoon: true,
  },
  {
    id: 'diskon',
    title: 'Diskon',
    href: '/diskon',
    icon: Tag,
    comingSoon: true,
  },
  {
    id: 'stok-manyar',
    title: 'Stok Manyar',
    href: '/stok-manyar',
    icon: Archive,
    comingSoon: true,
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
    id: 'daily-report-management',
    title: 'Laporan Harian',
    href: '/admin/daily-reports',
    icon: FileText,
    description: 'Kelola semua laporan keuangan harian.',
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
    id: 'wa-sender-sidebar',
    title: 'Laporan Harian',
    href: '/wa-sender',
    icon: MessageSquare,
    access: 'all',
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
