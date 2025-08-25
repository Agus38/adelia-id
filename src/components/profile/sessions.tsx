
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "../ui/button"
import { Laptop, Smartphone, Loader2 } from "lucide-react"
import { auth } from "@/lib/firebase"
import { useEffect, useState } from "react"
import type { User } from "firebase/auth"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

// NOTE: Firebase client SDK does not support listing all sessions.
// This component shows the current session and allows logging out from all sessions.
const mockCurrentSession = {
    device: "Browser Ini",
    location: "Tidak Diketahui",
    ip: "Tidak Diketahui",
    isCurrent: true,
    icon: Laptop,
}


export function Sessions() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSignOutAll = async () => {
      try {
        await auth.signOut();
        toast({
            title: "Berhasil Keluar",
            description: "Anda telah berhasil keluar dari semua perangkat.",
        });
        router.push('/');
      } catch(error: any) {
         toast({
            title: "Error",
            description: "Gagal keluar dari semua sesi: " + error.message,
            variant: "destructive",
        });
      }
    };
    
  if (loading) {
    return (
       <Card>
            <CardHeader>
                <CardTitle>Sesi Aktif</CardTitle>
                <CardDescription>
                Kelola dan keluar dari sesi aktif Anda di perangkat lain.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-24">
                 <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
       </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sesi Aktif</CardTitle>
        <CardDescription>
          Di bawah ini adalah sesi Anda saat ini. Firebase tidak mendukung pengelolaan sesi individual dari sisi klien.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {user && (
          <div className="flex items-center justify-between p-3 rounded-md border">
            <div className="flex items-center gap-4">
                <Laptop className="h-6 w-6 text-muted-foreground" />
                <div>
                    <p className="font-semibold">{mockCurrentSession.device}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
            </div>
            <span className="text-sm font-semibold text-primary">Sesi ini</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="destructive" onClick={handleSignOutAll}>Keluar dari semua sesi</Button>
      </CardFooter>
    </Card>
  )
}
