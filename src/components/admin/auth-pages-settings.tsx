
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginPageSettings } from './login-page-settings';
import { RegisterPageSettings } from './register-page-settings';

export function AuthPagesSettings() {
  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Halaman Login</TabsTrigger>
        <TabsTrigger value="register">Halaman Registrasi</TabsTrigger>
      </TabsList>
      <TabsContent value="login" className="pt-6">
        <LoginPageSettings />
      </TabsContent>
      <TabsContent value="register" className="pt-6">
        <RegisterPageSettings />
      </TabsContent>
    </Tabs>
  );
}
