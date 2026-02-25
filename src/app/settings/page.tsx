
'use client';

import { Separator } from "@/components/ui/separator";
import { ThemeSettings } from "@/components/settings/theme-settings";
import { Settings } from "lucide-react";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { AccountSettings } from "@/components/settings/account-settings";

export default function SettingsPage() {

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
       <div className="flex items-center space-x-2">
        <Settings className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan</h2>
      </div>
       <p className="text-muted-foreground">
        Kelola pengaturan aplikasi, preferensi notifikasi, dan akun Anda.
      </p>
      <Separator />
      <div className="space-y-6">
        <ThemeSettings />
        <Separator />
        <NotificationSettings />
        <Separator />
        <AccountSettings />
      </div>
    </div>
  )
}
