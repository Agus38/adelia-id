
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
  MessageSquare,
  Package,
  Calculator,
  Send,
  Cake,
  Repeat,
  Tag,
  Archive,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
  access: 'all' | 'admin';
  comingSoon?: boolean;
}

export const homeMenuItem: MenuItem = {
  id: 'home',
  title: 'Beranda',
  href: '/',
  icon: Home,
  description: 'Kembali ke halaman utama.',
  access: 'all',
};

export const menuItems: MenuItem[] = [
  {
    id: 'wa-sender',
    title: 'Laporan Harian',
    href: '/wa-sender',
    icon: MessageSquare,
    description: 'Kirim laporan harian via WhatsApp.',
    access: 'all',
  },
  {
    id: 'stok-produk',
    title: 'Stok Produk',
    href: '/stok-produk',
    icon: Package,
    description: 'Kelola inventaris produk Anda.',
    access: 'all',
    comingSoon: true,
  },
  {
    id: 'kalkulator',
    title: 'Kalkulator',
    href: '/kalkulator',
    icon: Calculator,
    description: 'Gunakan kalkulator untuk perhitungan cepat.',
    access: 'all',
    comingSoon: true,
  },
  {
    id: 'wa-smw',
    title: 'WA SMW',
    href: '/wa-smw',
    icon: Send,
    description: 'Kirim pesan WhatsApp melalui SMW.',
    access: 'all',
    comingSoon: true,
  },
  {
    id: 'nexus-ai',
    title: 'Nexus AI',
    href: '/ai-assistant',
    icon: Bot,
    description: 'Bantuan cerdas untuk tugas Anda.',
    access: 'all',
  },
  {
    id: 'cek-usia',
    title: 'Cek Usia',
    href: '/cek-usia',
    icon: Cake,
    description: 'Hitung usia berdasarkan tanggal lahir.',
    access: 'all',
    comingSoon: true,
  },
  {
    id: 'convert',
    title: 'Konversi',
    href: '/convert',
    icon: Repeat,
    description: 'Alat untuk mengonversi berbagai satuan.',
    access: 'all',
    comingSoon: true,
  },
  {
    id: 'diskon',
    title: 'Diskon',
    href: '/diskon',
    icon: Tag,
    description: 'Hitung harga setelah diskon.',
    access: 'all',
    comingSoon: true,
  },
  {
    id: 'stok-manyar',
    title: 'Stok Manyar',
    href: '/stok-manyar',
    icon: Archive,
    description: 'Kelola inventaris untuk lokasi Manyar.',
    access: 'all',
    comingSoon: true,
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
];
