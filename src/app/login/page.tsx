import * as React from 'react';
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { Loader2 } from 'lucide-react';
import { useRegisterPageConfig } from '@/lib/menu-store'; // Using register config as a placeholder for the image
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

// Re-using the register page image config for consistency, as there's no specific one for the wrapper
function LoginImage() {
    const { registerPageConfig, isLoading: isLoadingConfig } = useRegisterPageConfig();
    
    if (isLoadingConfig) {
        return <Skeleton className="h-full w-full" />;
    }

    return (
        <Image
            src={registerPageConfig.imageUrl}
            alt="Image"
            width="1887"
            height="1258"
            data-ai-hint={registerPageConfig.aiHint}
            className="h-full w-full object-cover dark:brightness-[0.3]"
            priority
        />
    );
}


export default function LoginPageWrapper() {
  return (
    <div className="w-full lg:grid lg:min-h-[calc(100vh-8rem)] lg:grid-cols-2">
       <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<Loading />}>
                <LoginForm />
            </Suspense>
       </div>
        <div className="hidden bg-muted lg:block">
            <Suspense fallback={<Skeleton className="h-full w-full" />}>
                <LoginImage />
            </Suspense>
        </div>
    </div>
  );
}
