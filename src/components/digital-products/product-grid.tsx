
'use client';

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "../ui/badge";
import { Wallet, Smartphone, Bolt, Gamepad2, Package, Loader2, type LucideIcon } from 'lucide-react';
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ProductInfo {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  comingSoon?: boolean;
}

const categoryConfig: Record<string, ProductInfo> = {
  pulsa: {
    id: 'pulsa',
    title: 'Pulsa',
    href: '/digital-products/pulsa',
    icon: Smartphone,
  },
  data: {
    id: 'data',
    title: 'Paket Data',
    href: '/digital-products/paket-data',
    icon: Wallet,
  },
  pln: {
    id: 'pln',
    title: 'Token Listrik',
    href: '/digital-products/token-listrik',
    icon: Bolt,
  },
  games: {
    id: 'games',
    title: 'Top Up Game',
    href: '/digital-products/game',
    icon: Gamepad2,
  },
  // Add other categories here as needed
};

export function ProductGrid() {
  const [availableProducts, setAvailableProducts] = useState<ProductInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const categories = new Set<string>();
        querySnapshot.forEach((doc) => {
          const category = doc.data().category;
          if (category && typeof category === 'string') {
            categories.add(category.toLowerCase());
          }
        });
        
        const productInfos = Array.from(categories)
          .map(cat => categoryConfig[cat])
          .filter(Boolean); // Filter out undefined configs

        // Ensure a consistent order
        const orderedProducts = Object.values(categoryConfig).filter(config => 
            productInfos.some(p => p.id === config.id)
        );

        setAvailableProducts(orderedProducts);

      } catch (error) {
        console.error("Error fetching product categories:", error);
        // Fallback to default or show an error
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
        <div className="grid grid-cols-3 gap-4 md:grid-cols-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
                 <Card key={index} className="aspect-square flex flex-col items-center justify-center p-2 sm:p-4 border-2 border-transparent shadow-lg rounded-2xl">
                     <CardContent className="p-0 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/50"/>
                     </CardContent>
                 </Card>
            ))}
        </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-4 md:grid-cols-4 md:gap-6">
      {availableProducts.map((item) => (
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
       {availableProducts.length === 0 && !isLoading && (
            <Card className="col-span-3 md:col-span-4 aspect-video flex flex-col items-center justify-center p-4 shadow-lg rounded-2xl bg-muted">
                 <CardContent className="p-0 flex flex-col items-center justify-center gap-2 text-center">
                    <Package className="h-10 w-10 text-muted-foreground" />
                    <p className="font-semibold text-foreground">
                        Belum Ada Produk Digital
                    </p>
                     <p className="text-sm text-muted-foreground">
                        Harap sinkronkan produk dari Digiflazz di Panel Admin untuk memulai.
                    </p>
                </CardContent>
            </Card>
       )}
    </div>
  );
}
