
'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { usePromoPopupConfig } from '@/lib/menu-store';
import Image from 'next/image';
import Link from 'next/link';

const PROMO_POPUP_SEEN_KEY = 'promoPopupVersionSeen';

export function PromoPopup() {
  const { promoPopupConfig, isLoading } = usePromoPopupConfig();
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (isLoading || !promoPopupConfig.enabled) {
      return;
    }

    const seenVersion = sessionStorage.getItem(PROMO_POPUP_SEEN_KEY);
    const currentVersion = String(promoPopupConfig.promoVersion || 1);

    if (seenVersion !== currentVersion) {
      // Delay opening popup to allow page to load
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem(PROMO_POPUP_SEEN_KEY, currentVersion);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, promoPopupConfig.enabled, promoPopupConfig.promoVersion]);

  if (isLoading || !promoPopupConfig.enabled || !isOpen) {
    return null;
  }

  const handleClose = () => {
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        {promoPopupConfig.imageUrl && (
            <div className="relative aspect-video w-full rounded-t-lg overflow-hidden">
                <Image
                    src={promoPopupConfig.imageUrl}
                    alt={promoPopupConfig.title}
                    fill
                    className="object-cover"
                />
            </div>
        )}
        <div className="p-6 space-y-4">
            <DialogHeader className="text-left">
                <DialogTitle>{promoPopupConfig.title}</DialogTitle>
                <DialogDescription>
                    {promoPopupConfig.description}
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                <Button variant="outline" onClick={handleClose} className="w-full">
                    Tutup
                </Button>
                {promoPopupConfig.buttonText && promoPopupConfig.buttonLink && (
                     <Button asChild className="w-full">
                        <Link href={promoPopupConfig.buttonLink} onClick={handleClose}>
                            {promoPopupConfig.buttonText}
                        </Link>
                    </Button>
                )}
            </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
