
'use client';

import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/components/profile/profile-form";
import { PasswordForm } from "@/components/profile/password-form";
import { Sessions } from "@/components/profile/sessions";
import { User, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { UserProfile } from "../layout";
import { supabase } from "@/lib/supabaseClient";

export default function SettingsProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUser({ ...user, ...profile });
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
       <div className="flex items-center space-x-2">
        <User className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Profil Pengguna</h2>
      </div>
       <p className="text-muted-foreground">
        Kelola pengaturan akun dan preferensi Anda.
      </p>
      <Separator />
      <div className="space-y-6">
        {user && <ProfileForm user={user} />}
        <Separator />
        <PasswordForm />
        <Separator />
        <Sessions />
      </div>
    </div>
  )
}
