
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
  TrendingUp,
  TrendingDown,
  Trash2,
  Github,
  LifeBuoy,
  Megaphone,
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
import { Button } from '../ui/button';
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { formatDistanceToNow, startOfToday, endOfToday, startOfYesterday, endOfYesterday } from 'date-fns';
import { id } from 'date-fns/locale';
import { useUserStore } from '@/lib/user-store';
import { cn } from '@/lib/utils';
import { getDocs } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '../ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteActivityLogs } from '@/ai/flows/delete-activity-logs';


interface ActivityLog {
  id: string;
  userName: string;
  userAvatar: string;
  action: string;
  target: string;
  timestamp: any;
}

interface DailyReport {
  date: Timestamp;
  omsetBersih: number;
}

interface SmwReport {
  date: Timestamp;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

function DeleteLogsDialog({ onActionComplete }: { onActionComplete: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { toast } = useToast();

  const handleDelete = async (filter: 'all' | 'today' | 'older') => {
    setIsDeleting(true);
    try {
      const authToken = await auth.currentUser?.getIdToken();
      if (!authToken) {
        throw new Error("Autentikasi pengguna tidak ditemukan.");
      }

      const result = await deleteActivityLogs({ filter, authToken });

      if (result.success) {
        toast({
          title: "Log Berhasil Dihapus",
          description: `${result.deletedCount || 0} log telah dihapus.`,
        });
        onActionComplete();
      } else {
        throw new Error(result.error || "Gagal menghapus log.");
      }
    } catch (error: any) {
      toast({
        title: "Gagal Menghapus Log",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Hapus Log</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Log Aktivitas</DialogTitle>
          <DialogDescription>
            Pilih opsi di bawah ini untuk membersihkan log aktivitas. Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          <Button onClick={() => handleDelete('all')} variant="destructive" disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Hapus Semua Log
          </Button>
          <Button onClick={() => handleDelete('today')} variant="outline" disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Hapus Log Hari Ini
          </Button>
          <Button onClick={() => handleDelete('older')} variant="outline" disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Hapus Log Lama (sebelum hari ini)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
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
    title: "Manajemen Popup",
    href: "/admin/promo-popup",
    icon: Megaphone,
    description: "Kelola popup notifikasi di halaman utama.",
  },
  {
    title: "Daftar Rute Aplikasi",
    href: "/admin/routes",
    icon: LinkIcon,
    description: "Lihat semua rute halaman aplikasi.",
  },
  {
    title: "Sinkronisasi GitHub",
    href: "/admin/github-sync",
    icon: Github,
    description: "Panduan untuk mengunggah proyek ke GitHub.",
  },
  {
    title: "Pengaturan Halaman Bantuan",
    href: "/admin/support",
    icon: LifeBuoy,
    description: "Kelola konten halaman Bantuan &amp; Dukungan.",
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
  const [dailyRevenue, setDailyRevenue] = React.useState(0);
  const [revenuePercentageChange, setRevenuePercentageChange] = React.useState<number | null>(null);
  const [dailyReportsCount, setDailyReportsCount] = React.useState(0);
  const [smwReportsCount, setSmwReportsCount] = React.useState(0);
  const [loadingStats, setLoadingStats] = React.useState(true);
  const [recentActivities, setRecentActivities] = React.useState<ActivityLog[]>([]);
  const [loadingActivities, setLoadingActivities] = React.useState(true);
  const [activityLogKey, setActivityLogKey] = React.useState(0);

  const refreshActivities = () => {
    setActivityLogKey(prev => prev + 1);
  }

  React.useEffect(() => {
    if (isLoadingUser || user?.role !== 'Admin') {
      if (!isLoadingUser) {
        setLoadingStats(false);
        setLoadingActivities(false);
      }
      return;
    }

    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const usersCollection = collection(db, 'users');
        const dailyReportsCollection = collection(db, 'dailyReports');
        const smwReportsCollection = collection(db, 'smwManyarReports');

        const [usersSnapshot, dailyReportsSnapshot, smwReportsSnapshot] = await Promise.all([
            getDocs(usersCollection),
            getDocs(dailyReportsCollection),
            getDocs(smwReportsCollection),
        ]);

        setUserCount(usersSnapshot.size);

        const allDailyReports = dailyReportsSnapshot.docs.map(doc => doc.data() as DailyReport);
        const allSmwReports = smwReportsSnapshot.docs.map(doc => doc.data() as SmwReport);
        
        const todayStart = startOfToday();
        const todayEnd = endOfToday();
        const yesterdayStart = startOfYesterday();
        const yesterdayEnd = endOfYesterday();

        const todayReports = allDailyReports.filter(report => {
            const reportDate = report.date.toDate();
            return reportDate >= todayStart && reportDate <= todayEnd;
        });

        const yesterdayReports = allDailyReports.filter(report => {
            const reportDate = report.date.toDate();
            return reportDate >= yesterdayStart && reportDate <= yesterdayEnd;
        });

        const todayRevenue = todayReports.reduce((sum, report) => sum + report.omsetBersih, 0);
        const yesterdayRevenue = yesterdayReports.reduce((sum, report) => sum + report.omsetBersih, 0);
        
        setDailyRevenue(todayRevenue);
        setDailyReportsCount(todayReports.length);
        
        if (yesterdayRevenue > 0) {
            const change = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
            setRevenuePercentageChange(change);
        } else if (todayRevenue > 0) {
            setRevenuePercentageChange(100);
        } else {
            setRevenuePercentageChange(0);
        }

        const todaySmwReports = allSmwReports.filter(report => {
            const reportDate = report.date.toDate();
            return reportDate >= todayStart && reportDate <= todayEnd;
        });
        setSmwReportsCount(todaySmwReports.length);

      } catch (error) {
        console.error("Failed to fetch stats:", error);
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
  }, [isLoadingUser, user, activityLogKey]);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan (Hari Ini)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loadingStats ? (
                <div className="flex items-center justify-center h-12">
                   <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                  <div className="text-2xl font-bold">{formatCurrency(dailyRevenue)}</div>
                   {revenuePercentageChange !== null && (
                      <p className={cn(
                          "text-xs text-muted-foreground flex items-center gap-1",
                          revenuePercentageChange > 0 && "text-green-600",
                          revenuePercentageChange < 0 && "text-red-600"
                      )}>
                          {revenuePercentageChange > 0 && <TrendingUp className="h-3 w-3" />}
                          {revenuePercentageChange < 0 && <TrendingDown className="h-3 w-3" />}
                          {revenuePercentageChange.toFixed(1)}% dari kemarin
                      </p>
                  )}
                </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laporan Harian (Hari Ini)</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loadingStats ? (
                <div className="flex items-center justify-center h-12">
                   <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                    <div className="text-2xl font-bold">{dailyReportsCount} Laporan</div>
                    <p className="text-xs text-muted-foreground">Total laporan masuk hari ini</p>
                </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laporan SMW (Hari Ini)</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
                <div className="flex items-center justify-center h-12">
                   <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                  <div className="text-2xl font-bold">{smwReportsCount} Laporan</div>
                  <p className="text-xs text-muted-foreground">Total laporan SMW hari ini</p>
                </>
            )}
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
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Aktivitas Terbaru</CardTitle>
              <CardDescription>
                Log tindakan terbaru yang dilakukan di aplikasi.
              </CardDescription>
            </div>
             <DeleteLogsDialog onActionComplete={refreshActivities} />
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
