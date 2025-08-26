
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import * as React from "react"

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
import { auth } from "@/lib/firebase"
import { updatePassword } from "firebase/auth"
import { Eye, EyeOff, Loader2 } from "lucide-react"

const passwordFormSchema = z.object({
  newPassword: z.string().min(6, {message: "Kata sandi baru minimal 6 karakter."}),
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
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues,
  })

  async function onSubmit(data: PasswordFormValues) {
    const user = auth.currentUser;
    if (!user) {
        toast({
            title: "Error",
            description: "Anda harus login untuk mengubah kata sandi.",
            variant: "destructive"
        });
        return;
    }
    
    try {
        await updatePassword(user, data.newPassword);
        toast({
            title: "Kata Sandi Diperbarui",
            description: "Kata sandi Anda telah berhasil diubah.",
        });
        form.reset();
    } catch(error: any) {
        toast({
            title: "Error",
            description: "Gagal memperbarui kata sandi: " + error.message,
            variant: "destructive"
        });
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
                          <div className="relative">
                            <Input type={showNewPassword ? "text" : "password"} placeholder="Masukkan kata sandi baru" {...field} />
                             <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute inset-y-0 right-0 h-full px-3"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                              <span className="sr-only">
                                {showNewPassword ? 'Sembunyikan' : 'Tampilkan'} kata sandi
                              </span>
                            </Button>
                          </div>
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
                          <div className="relative">
                            <Input type={showConfirmPassword ? "text" : "password"} placeholder="Konfirmasi kata sandi baru" {...field} />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute inset-y-0 right-0 h-full px-3"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                              <span className="sr-only">
                                {showConfirmPassword ? 'Sembunyikan' : 'Tampilkan'} kata sandi
                              </span>
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
            <CardFooter>
                 <Button type="submit" disabled={form.formState.isSubmitting}>
                   {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   Perbarui Kata Sandi
                 </Button>
            </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
