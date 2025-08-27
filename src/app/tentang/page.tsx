
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, CheckCircle, Loader2 } from 'lucide-react';
import { useAboutInfoConfig, useBrandingConfig } from '@/lib/menu-store';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Logo } from '@/components/icons';

export default function AboutPage() {
    const { aboutInfo, isLoading: isLoadingAbout } = useAboutInfoConfig();
    const { brandingConfig, isLoading: isLoadingBranding } = useBrandingConfig();

    const isLoading = isLoadingAbout || isLoadingBranding;

    const renderLogo = () => {
        if (isLoading) {
          return <Skeleton className="h-10 w-10 rounded-full" />;
        }
    
        const LogoComponent = brandingConfig.icon || Logo;
    
        return (
          <>
            {brandingConfig.logoType === 'icon' ? (
              <LogoComponent className="h-10 w-10 text-primary" />
            ) : (
              brandingConfig.imageUrl && <Image src={brandingConfig.imageUrl} alt={`${brandingConfig.appName} Logo`} width={40} height={40} className="h-10 w-10 object-contain" />
            )}
          </>
        );
      };


    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 flex items-center justify-center">
            <Card className="w-full max-w-3xl">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        {renderLogo()}
                    </div>
                    <CardTitle className="text-3xl font-bold">{aboutInfo.appName}</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">
                        {aboutInfo.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center">
                        <h3 className="text-xl font-semibold mb-4">Fitur Utama</h3>
                        <div className="flex flex-wrap justify-center gap-3">
                            {aboutInfo.features.map((feature, index) => (
                                <Badge key={index} variant="secondary" className="text-sm py-1 px-3 flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    {feature}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center text-center text-sm text-muted-foreground pt-4">
                    <p>Versi Aplikasi: <strong>{aboutInfo.version}</strong></p>
                </CardFooter>
            </Card>
        </div>
    );
}
