
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
import { Camera } from "lucide-react"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nama harus memiliki setidaknya 2 karakter.",
  }),
  email: z
    .string({
      required_error: "Silakan masukkan email.",
    })
    .email(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const defaultValues: Partial<ProfileFormValues> = {
  name: "Adelia",
  email: "adelia@example.com",
}

export function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  })

  function onSubmit(data: ProfileFormValues) {
    toast({
      title: "Data yang Anda kirimkan:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
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
                                <AvatarImage src="https://placehold.co/100x100.png" alt="@adelia" data-ai-hint="user avatar" />
                                <AvatarFallback>A</AvatarFallback>
                            </Avatar>
                            <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-7 w-7">
                                <Camera className="h-4 w-4"/>
                                <span className="sr-only">Ubah Foto</span>
                            </Button>
                        </div>
                         <div className="space-y-1">
                            <h3 className="font-semibold text-lg">{defaultValues.name}</h3>
                            <p className="text-sm text-muted-foreground">{defaultValues.email}</p>
                        </div>
                    </div>
                     <FormField
                        control={form.control}
                        name="name"
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
                                <Input placeholder="email@anda.com" {...field} readOnly />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                     />
                </CardContent>
                <CardFooter>
                    <Button type="submit">Simpan Perubahan</Button>
                </CardFooter>
            </form>
        </Form>
    </Card>
  )
}
