
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

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, {message: "Kata sandi saat ini diperlukan."}),
  newPassword: z.string().min(8, {message: "Kata sandi baru minimal 8 karakter."}),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Kata sandi tidak cocok.",
    path: ["confirmPassword"]
})

type PasswordFormValues = z.infer<typeof passwordFormSchema>

const defaultValues: Partial<PasswordFormValues> = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
}

export function PasswordForm() {
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues,
  })

  function onSubmit(data: PasswordFormValues) {
    console.log(data);
    toast({
      title: "Kata Sandi Diperbarui",
      description: "Kata sandi Anda telah berhasil diubah.",
    })
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CardHeader>
                <CardTitle>Ubah Kata Sandi</CardTitle>
                <CardDescription>Ganti kata sandi Anda di sini. Setelah menyimpan, Anda akan keluar dari sesi ini.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Kata Sandi Saat Ini</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="Masukkan kata sandi saat ini" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
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
                 <Button type="submit">Perbarui Kata Sandi</Button>
            </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
