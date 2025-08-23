
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Smartphone, Bolt, Gamepad2 } from 'lucide-react';
import Link from 'next/link';

const digitalProducts = [
  {
    id: 'pulsa',
    title: 'Pulsa',
    description: 'Isi ulang pulsa prabayar untuk semua operator.',
    href: '/digital-products/pulsa',
    icon: Smartphone,
  },
  {
    id: 'paket-data',
    title: 'Paket Data',
    description: 'Beli paket internet untuk tetap terhubung.',
    href: '/digital-products/paket-data',
    icon: Wallet, // Using Wallet as a placeholder, could be Wifi icon
  },
  {
    id: 'token-listrik',
    title: 'Token Listrik',
    description: 'Beli token listrik PLN prabayar dengan mudah.',
    href: '/digital-products/token-listrik',
    icon: Bolt,
  },
  {
    id: 'game',
    title: 'Top Up Game',
    description: 'Beli voucher dan item untuk game favoritmu.',
    href: '/digital-products/game',
    icon: Gamepad2,
  },
];

export default function DigitalProductsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col items-start space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Produk Digital</h2>
        <p className="text-muted-foreground">
          Pilih layanan produk digital yang Anda butuhkan.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
        {digitalProducts.map((product) => (
          <Link href={product.href} key={product.id}>
            <Card className="hover:border-primary hover:shadow-lg transition-all duration-200 h-full">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <product.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-xl mb-1">{product.title}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
