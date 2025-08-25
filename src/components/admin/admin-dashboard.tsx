
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  LayoutGrid,
  Settings2,
  BarChart,
  FileText,
  Activity,
  DollarSign,
  Users2,
  CreditCard,
  ImageIcon,
  Lock,
} from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const managementLinks = [
  {
    title: "Manajemen Pengguna",
    href: "/admin/users",
    icon: Users,
    description: "Kelola pengguna, peran, dan hak akses.",
  },
  {
    title: "Manajemen Sesi",
    href: "/admin/sessions",
    icon: Lock,
    description: "Kelola sesi pengguna yang aktif.",
  },
  {
    title: "Manajemen Tim",
    href: "/admin/tim",
    icon: Users2,
    description: "Kelola anggota tim yang ditampilkan.",
  },
  {
    title: "Manajemen Laporan Harian",
    href: "/admin/daily-reports",
    icon: FileText,
    description: "Kelola semua laporan keuangan harian.",
  },
   {
    title: "Manajemen SMW Manyar",
    href: "/admin/smw-manyar",
    icon: FileText,
    description: "Kelola item dan pengaturan untuk laporan SMW.",
  },
  {
    title: "Manajemen Menu",
    href: "/admin/menus",
    icon: LayoutGrid,
    description: "Sesuaikan item menu, ikon, dan visibilitas.",
  },
  {
    title: "Manajemen Banner",
    href: "/admin/banner",
    icon: ImageIcon,
    description: "Kelola banner dan slide di halaman utama.",
  },
  {
    title: "Pengaturan Sistem",
    href: "/admin/setup",
    icon: Settings2,
    description: "Konfigurasi dan integrasi sistem.",
  },
];

const recentActivities = [
   {
    user: { name: "Adelia", avatar: "https://placehold.co/100x100.png" },
    action: "mengirimkan laporan",
    target: "Laporan Harian",
    time: "2 menit yang lalu",
  },
  {
    user: { name: "Budi", avatar: "https://placehold.co/100x100.png" },
    action: "menambahkan pengguna baru",
    target: "Citra",
    time: "5 menit yang lalu",
  },
  {
    user: { name: "Adelia", avatar: "https://placehold.co/100x100.png" },
    action: "mengirimkan laporan",
    target: "SMW Manyar",
    time: "15 menit yang lalu",
  },
  {
    user: { name: "Citra", avatar: "https://placehold.co/100x100.png" },
    action: "memperbarui item menu",
    target: "Stok Produk",
    time: "1 jam yang lalu",
  },
];

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan (Harian)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp5.231.890</div>
            <p className="text-xs text-muted-foreground">+2.5% dari kemarin</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laporan Harian (Hari Ini)</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 Laporan</div>
            <p className="text-xs text-muted-foreground">1 Menunggu Persetujuan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laporan SMW (Hari Ini)</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1 Laporan</div>
            <p className="text-xs text-muted-foreground">Terkirim pukul 08:30</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengguna Aktif</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+8</div>
            <p className="text-xs text-muted-foreground">+2 baru bulan ini</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Management Links */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Pusat Manajemen</CardTitle>
            <CardDescription>
              Akses cepat ke alat manajemen inti.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {managementLinks.map((link) => (
              <Link
                href={link.href}
                key={link.href}
                className="block p-4 rounded-lg hover:bg-muted/50 border transition-colors"
              >
                <div className="flex items-start gap-4">
                  <link.icon className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">{link.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>
              Log tindakan terbaru yang dilakukan di panel admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead>Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map((activity, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={activity.user.avatar} alt={activity.user.name} data-ai-hint="user avatar" />
                          <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{activity.user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {activity.action}{" "}
                      <Badge variant="secondary">{activity.target}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {activity.time}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
