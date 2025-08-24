
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
import { supabase } from "@/lib/supabaseClient"
import { Loader2 } from "lucide-react"

const passwordFormSchema = z.object({
  // We remove currentPassword as it's not needed for Supabase's updateUser method for password changes
  newPassword: z.string().min(8, {message: "Kata sandi baru minimal 8 karakter."}),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Kata sandi tidak cocok.",
    path: ["confirmPassword"]
})

type PasswordFormValues = z.infer<typeof passwordFormSchema>

const defaultValues: Partial<PasswordFormValues> = {
    newPassword: "",
    confirmPassword: ""
}

export function PasswordForm() {
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues,
  })

  async function onSubmit(data: PasswordFormValues) {
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword
    });
    
    if (error) {
       toast({
        title: "Error",
        description: "Gagal memperbarui kata sandi: " + error.message,
        variant: "destructive"
      })
    } else {
       toast({
        title: "Kata Sandi Diperbarui",
        description: "Kata sandi Anda telah berhasil diubah.",
      })
      form.reset();
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CardHeader>
                <CardTitle>Ubah Kata Sandi</CardTitle>
                <CardDescription>Ganti kata sandi Anda di sini. Untuk keamanan, sebaiknya keluar setelah mengubah kata sandi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Kata Sandi Baru</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="Masukkan kata sandi baru" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Konfirmasi Kata Sandi Baru</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="Konfirmasi kata sandi baru" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
            <CardFooter>
                 <Button type="submit" disabled={form.formState.isSubmitting}>
                   {form.formState.isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                   Perbarui Kata Sandi
                 </Button>
            </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
