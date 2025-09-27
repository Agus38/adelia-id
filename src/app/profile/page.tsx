
'use client';

import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/components/profile/profile-form";
import { PasswordForm } from "@/components/profile/password-form";
import { User } from "lucide-react";

export default function SettingsProfilePage() {

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
        <ProfileForm />
        <Separator />
        <PasswordForm />
      </div>
    </div>
  )
}
