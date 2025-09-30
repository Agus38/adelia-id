
'use client';

import * as React from 'react';
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
  FileText,
  DollarSign,
  Users2,
  Lock,
  PanelLeft,
  Info,
  Loader2,
  Link as LinkIcon,
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
import { db } from '@/lib/firebase';
import { collection, getDocs, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useUserStore } from '@/lib/user-store';

interface ActivityLog {
  id: string;
  userName: string;
  userAvatar: string;
  action: string;
  target: string;
  timestamp: any;
}

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
    title: "Manajemen Sidebar Admin",
    href: "/admin/admin-sidebar",
    icon: PanelLeft,
    description: "Sesuaikan item menu di sidebar admin.",
  },
  {
    title: "Manajemen Banner",
    href: "/admin/banner",
    icon: Info, // Changed to a more generic icon
    description: "Kelola banner dan slide di halaman utama.",
  },
  {
    title: "Daftar Rute Aplikasi",
    href: "/admin/routes",
    icon: LinkIcon,
    description: "Lihat semua rute halaman aplikasi.",
  },
  {
    title: "Pengaturan 'Tentang'",
    href: "/admin/tentang",
    icon: Info,
    description: "Kelola konten halaman Tentang Aplikasi.",
  },
  {
    title: "Pengaturan Sistem",
    href: "/admin/setup",
    icon: Settings2,
    description: "Konfigurasi dan integrasi sistem.",
  },
];


export function AdminDashboard() {
  const { user, loading: isLoadingUser } = useUserStore();
  const [userCount, setUserCount] = React.useState<number | null>(null);
  const [loadingStats, setLoadingStats] = React.useState(true);
  const [recentActivities, setRecentActivities] = React.useState<ActivityLog[]>([]);
  const [loadingActivities, setLoadingActivities] = React.useState(true);


  React.useEffect(() => {
    // Wait until user role is confirmed before fetching data
    if (isLoadingUser || user?.role !== 'Admin') {
      if (!isLoadingUser) {
        // If loading is finished and user is not admin, stop loading stats.
        setLoadingStats(false);
        setLoadingActivities(false);
      }
      return;
    }

    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        setUserCount(usersSnapshot.size);
      } catch (error) {
        console.error("Failed to fetch user count:", error);
        setUserCount(0); // Set to 0 on error
      } finally {
        setLoadingStats(false);
      }
    };

    const unsubscribeActivities = onSnapshot(
      query(collection(db, 'activityLogs'), orderBy('timestamp', 'desc'), limit(5)),
      (snapshot) => {
        const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog));
        setRecentActivities(activities);
        setLoadingActivities(false);
      },
      (error) => {
        console.error("Failed to fetch activities:", error);
        setLoadingActivities(false);
      }
    );

    fetchStats();

    return () => unsubscribeActivities();
  }, [isLoadingUser, user]);

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
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loadingStats ? (
                <div className="flex items-center justify-center h-12">
                   <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                  <div className="text-2xl font-bold">{userCount === null ? '-' : userCount}</div>
                  <p className="text-xs text-muted-foreground">Total pengguna terdaftar</p>
                </>
            )}
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
              Log tindakan terbaru yang dilakukan di aplikasi.
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
                {loadingActivities ? (
                   <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                          <p className="text-sm mt-2">Memuat aktivitas...</p>
                      </TableCell>
                  </TableRow>
                ) : recentActivities.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                          Belum ada aktivitas.
                      </TableCell>
                  </TableRow>
                ) : (
                  recentActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={activity.userAvatar || undefined} alt={activity.userName} data-ai-hint="user avatar" />
                            <AvatarFallback>{activity.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{activity.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {activity.action}{" "}
                        <Badge variant="secondary">{activity.target}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {activity.timestamp ? formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true, locale: id }) : ''}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
