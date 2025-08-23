
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Smartphone, Bolt, Gamepad2 } from 'lucide-react';
import { Badge } from "../ui/badge";


const digitalProducts = [
  {
    id: 'pulsa',
    title: 'Pulsa',
    description: 'Isi ulang pulsa prabayar untuk semua operator.',
    href: '/digital-products/pulsa',
    icon: Smartphone,
    comingSoon: false,
  },
  {
    id: 'paket-data',
    title: 'Paket Data',
    description: 'Beli paket internet untuk tetap terhubung.',
    href: '/digital-products/paket-data',
    icon: Wallet, // Using Wallet as a placeholder, could be Wifi icon
    comingSoon: true,
  },
  {
    id: 'token-listrik',
    title: 'Token Listrik',
    description: 'Beli token listrik PLN prabayar dengan mudah.',
    href: '/digital-products/token-listrik',
    icon: Bolt,
    comingSoon: true,
  },
  {
    id: 'game',
    title: 'Top Up Game',
    description: 'Beli voucher dan item untuk game favoritmu.',
    href: '/digital-products/game',
    icon: Gamepad2,
    comingSoon: true,
  },
];

export function ProductGrid() {
    return (
        <div className="grid grid-cols-3 gap-4 md:grid-cols-4 md:gap-6">
            {digitalProducts.map((item) => (
                <Link href={item.href} key={item.id} className={item.comingSoon ? "pointer-events-none" : ""}>
                    <Card className="hover:bg-primary/20 transition-colors duration-200 aspect-square flex flex-col items-center justify-center p-2 sm:p-4 border-2 border-transparent hover:border-primary/50 dark:border-gray-800 dark:hover:border-primary/70 shadow-lg rounded-2xl relative">
                        <CardContent className="p-0 flex flex-col items-center justify-center gap-2">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <item.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                            </div>
                            <p className="text-[11px] leading-tight sm:text-sm text-center font-semibold text-foreground">
                                {item.title}
                            </p>
                            {item.comingSoon && (
                                <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5">
                                    Segera
                                </Badge>
                            )}
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
