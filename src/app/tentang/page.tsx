
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, CheckCircle, Loader2 } from 'lucide-react';
import { useAboutInfoConfig } from '@/lib/menu-store';

export default function AboutPage() {
    const { aboutInfo, isLoading } = useAboutInfoConfig();

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
                        <Info className="h-10 w-10 text-primary" />
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
