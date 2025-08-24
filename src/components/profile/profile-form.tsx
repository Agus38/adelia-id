
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Camera, Loader2 } from "lucide-react"
import type { UserProfile } from "@/app/layout"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

const profileFormSchema = z.object({
  full_name: z.string().min(2, {
    message: "Nama harus memiliki setidaknya 2 karakter.",
  }),
  email: z.string().email(),
  avatar_url: z.string().url().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
  user: UserProfile;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: user.full_name || "",
      email: user.email,
      avatar_url: user.avatar_url || "",
    },
    mode: "onChange",
  })

  const getAvatarFallback = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  }

  async function onSubmit(data: ProfileFormValues) {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.full_name,
        avatar_url: data.avatar_url,
      })
      .eq('id', user.id);

    if (error) {
       toast({
        title: "Error",
        description: "Gagal memperbarui profil: " + error.message,
        variant: "destructive"
      })
    } else {
       toast({
        title: "Profil Diperbarui",
        description: "Informasi profil Anda telah berhasil disimpan.",
      })
      router.refresh();
    }
  }

  return (
     <Card>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <CardHeader>
                    <CardTitle>Informasi Pribadi</CardTitle>
                    <CardDescription>Perbarui foto profil dan detail pribadi Anda di sini.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name || "User Avatar"} data-ai-hint="user avatar" />
                                <AvatarFallback>{getAvatarFallback(user.full_name, user.email)}</AvatarFallback>
                            </Avatar>
                            <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-7 w-7" type="button">
                                <Camera className="h-4 w-4"/>
                                <span className="sr-only">Ubah Foto</span>
                            </Button>
                        </div>
                         <div className="space-y-1">
                            <h3 className="font-semibold text-lg">{form.watch('full_name')}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                     <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Nama Lengkap</FormLabel>
                            <FormControl>
                                <Input placeholder="Nama Anda" {...field} />
                            </FormControl>
                             <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="email@anda.com" {...field} disabled />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                     />
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                       {form.formState.isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                       Simpan Perubahan
                    </Button>
                </CardFooter>
            </form>
        </Form>
    </Card>
  )
}
