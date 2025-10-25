
'use client';

import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/components/profile/profile-form";
import { PasswordForm } from "@/components/profile/password-form";
import { Loader2, User } from "lucide-react";
import { useUserStore } from "@/lib/user-store";
import { useRouter } from "next/navigation";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

function ProfileSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-48" />
      </div>
      <Skeleton className="h-4 w-64" />
      <Separator />
      <div className="space-y-6">
        {/* ProfileForm Skeleton */}
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
        </div>
        <Separator />
        {/* PasswordForm Skeleton */}
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-40" />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading } = useUserStore();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  if (loading || !user) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
       <div className="flex items-center space-x-2">
        <User className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Profil Pengguna</h2>
      </div>
       <p className="text-muted-foreground">
        Kelola informasi profil dan kata sandi Anda.
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
