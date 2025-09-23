
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRef, useState, useEffect } from "react"

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
import { auth, db, storage } from "@/lib/firebase"
import { updateProfile } from "firebase/auth"
import { doc, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useUserStore } from "@/lib/user-store"

const profileFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Nama harus memiliki setidaknya 2 karakter.",
  }),
  email: z.string().email(),
  photoURL: z.string().url().optional().or(z.literal('')),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const { user, loading: loadingUser } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      photoURL: "",
    },
    mode: "onChange",
  })
  
  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || user.displayName || "",
        email: user.email || "",
        photoURL: user.avatarUrl || user.photoURL || "",
      });
    }
  }, [user, form]);


  const getAvatarFallback = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  }

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setIsUploading(true);
    const storageRef = ref(storage, `avatars/${auth.currentUser.uid}/${file.name}_${Date.now()}`);
    
    try {
        await uploadBytes(storageRef, file);
        const photoURL = await getDownloadURL(storageRef);
        
        await updateProfile(auth.currentUser, { photoURL });
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userDocRef, { avatarUrl: photoURL });

        toast({
            title: "Avatar Diperbarui",
            description: "Foto profil Anda telah berhasil diubah.",
        });

    } catch (error) {
         toast({
            title: "Upload Gagal",
            description: "Gagal mengunggah avatar. Pastikan file adalah gambar dan coba lagi.",
            variant: "destructive"
        });
    } finally {
        setIsUploading(false);
    }
  }

  async function onSubmit(data: ProfileFormValues) {
    if (!auth.currentUser) {
        toast({ title: "Error", description: "Tidak ada pengguna yang login.", variant: "destructive" });
        return;
    };
    
    try {
        await updateProfile(auth.currentUser, { displayName: data.fullName });
        
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userDocRef, { fullName: data.fullName });

        toast({
            title: "Profil Diperbarui",
            description: "Informasi profil Anda telah berhasil disimpan.",
        });
        form.reset(data); // reset to keep form from being dirty
    } catch (error) {
        toast({
            title: "Error",
            description: "Gagal memperbarui profil.",
            variant: "destructive"
        });
    }
  }
  
  if (loadingUser) {
     return (
       <Card>
        <CardHeader>
            <CardTitle>Informasi Pribadi</CardTitle>
            <CardDescription>Perbarui foto profil dan detail pribadi Anda di sini.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
       </Card>
     )
  }
  
  const isButtonDisabled = isUploading || form.formState.isSubmitting || !form.formState.isDirty;

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
                                <AvatarImage src={form.watch('photoURL') ?? undefined} alt={user?.fullName || "User Avatar"} data-ai-hint="user avatar" />
                                <AvatarFallback>{getAvatarFallback(user?.fullName, user?.email)}</AvatarFallback>
                                 {isUploading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                                    </div>
                                )}
                            </Avatar>
                            <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-7 w-7" type="button" onClick={handleAvatarButtonClick} disabled={isUploading}>
                                <Camera className="h-4 w-4"/>
                                <span className="sr-only">Ubah Foto</span>
                            </Button>
                             <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                className="hidden"
                                accept="image/png, image/jpeg"
                                disabled={isUploading}
                            />
                        </div>
                         <div className="space-y-1">
                            <h3 className="font-semibold text-lg">{form.watch('fullName')}</h3>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>
                     <FormField
                        control={form.control}
                        name="fullName"
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
                    <Button type="submit" disabled={isButtonDisabled}>
                       {(form.formState.isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       Simpan Perubahan
                    </Button>
                </CardFooter>
            </form>
        </Form>
    </Card>
  )
}
