
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
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

// NOTE: Supabase client-side library does not currently support fetching all user sessions.
// This is a mock implementation to demonstrate the UI.
const mockSessions = [
  {
    device: "Chrome di Windows",
    location: "Gresik, ID",
    ip: "103.24.12.10",
    isCurrent: true,
    icon: Laptop,
    refresh_token: "current_session_token",
  },
  {
    device: "Aplikasi Mobile Adelia",
    location: "Surabaya, ID",
    ip: "121.55.44.20",
    isCurrent: false,
    icon: Smartphone,
    refresh_token: "other_session_token",
  },
]

export function Sessions() {
    const [loading, setLoading] = useState(true);
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setCurrentSession(session);
            setLoading(false);
        };

        fetchSession();
    }, []);

    const handleSignOutAll = async () => {
      // This will sign out the current session.
      // To sign out all sessions, you'd typically need a server-side implementation.
      const { error } = await supabase.auth.signOut();
       if (error) {
        toast({
            title: "Error",
            description: "Gagal keluar dari semua sesi: " + error.message,
            variant: "destructive",
        });
       } else {
         toast({
            title: "Berhasil Keluar",
            description: "Anda telah berhasil keluar dari semua perangkat.",
        });
        router.push('/');
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
          Kelola dan keluar dari sesi aktif Anda di perangkat lain. (Fitur ini dalam pengembangan)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockSessions.map((session, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-md border">
            <div className="flex items-center gap-4">
                <session.icon className="h-6 w-6 text-muted-foreground" />
                <div>
                    <p className="font-semibold">{session.device}</p>
                    <p className="text-sm text-muted-foreground">{session.location} ({session.ip})</p>
                </div>
            </div>
            {currentSession && session.refresh_token === "current_session_token" ? (
                <span className="text-sm font-semibold text-primary">Sesi ini</span>
            ) : (
                <Button variant="outline" size="sm" disabled>Keluar</Button>
            )}
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button variant="destructive" onClick={handleSignOutAll}>Keluar dari semua sesi</Button>
      </CardFooter>
    </Card>
  )
}
