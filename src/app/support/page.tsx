
'use client';

import * as React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LifeBuoy, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSupportPageConfig } from "@/lib/menu-store";
import { Skeleton } from '@/components/ui/skeleton';

export default function SupportPage() {
  const { supportConfig, isLoading } = useSupportPageConfig();

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-4 w-1/2" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const { faqItems, contactMethods } = supportConfig;

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <LifeBuoy className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Bantuan &amp; Dukungan</h2>
      </div>
      <p className="text-muted-foreground">
        Temukan jawaban atas pertanyaan Anda atau hubungi tim kami untuk bantuan lebih lanjut.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQ Section */}
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Pertanyaan yang Sering Diajukan (FAQ)</CardTitle>
                    <CardDescription>Jawaban cepat untuk pertanyaan umum.</CardDescription>
                </CardHeader>
                <CardContent>
                    {faqItems.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                            {faqItems.map((item) => (
                                <AccordionItem value={item.id} key={item.id}>
                                    <AccordionTrigger>{item.question}</AccordionTrigger>
                                    <AccordionContent>
                                        {item.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                        <div className="text-center text-muted-foreground py-10">
                            Tidak ada pertanyaan yang sering diajukan saat ini.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Contact & Resources Section */}
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Hubungi Kami</CardTitle>
                    <CardDescription>Butuh bantuan lebih lanjut? Kami siap membantu.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {contactMethods.length > 0 ? (
                      contactMethods.map((method) => {
                          const IconComponent = method.icon;
                          return (
                            <div key={method.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                                <div className="flex items-center gap-4">
                                    <IconComponent className="h-6 w-6 text-primary" />
                                    <div>
                                        <p className="font-semibold text-sm">{method.title}</p>
                                        <p className="text-xs text-muted-foreground">{method.value}</p>
                                    </div>
                                </div>
                                <a href={method.action} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm">{method.actionLabel}</Button>
                                </a>
                            </div>
                          )
                      })
                    ) : (
                       <div className="text-center text-muted-foreground py-10">
                            Tidak ada metode kontak yang tersedia.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
