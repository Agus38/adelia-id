
import { ProductGrid } from '@/components/digital-products/product-grid';

export default function DigitalProductsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col items-start space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Produk Digital</h2>
        <p className="text-muted-foreground">
          Pilih layanan produk digital yang Anda butuhkan.
        </p>
      </div>

      <div className="pt-6">
        <ProductGrid />
      </div>
    </div>
  );
}
