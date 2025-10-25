
'use client';

import { ProductGrid } from '@/components/digital-products/product-grid';
import { UserBalanceCard } from '@/components/digital-products/pulsa/user-balance-card';
import { usePageAccess } from '@/hooks/use-page-access';
import { Skeleton } from '@/components/ui/skeleton';

function DigitalProductsSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      <div className="flex justify-center">
        <Skeleton className="h-[90px] w-full max-w-lg rounded-lg" />
      </div>

      <div className="pt-6">
         <div className="grid grid-cols-3 gap-4 md:grid-cols-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square rounded-2xl" />
            ))}
        </div>
      </div>
    </div>
  );
}

export default function DigitalProductsPage() {
  const { hasAccess, isLoading } = usePageAccess('digital-products');
  
  if (isLoading) {
    return <DigitalProductsSkeleton />;
  }

  if (!hasAccess) {
    return null; // The hook will handle the redirect.
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col items-start space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Produk Digital</h2>
        <p className="text-muted-foreground">
          Pilih layanan produk digital yang Anda butuhkan.
        </p>
      </div>

      <div className="flex justify-center">
        <UserBalanceCard />
      </div>

      <div className="pt-6">
        <ProductGrid />
      </div>
    </div>
  );
}
