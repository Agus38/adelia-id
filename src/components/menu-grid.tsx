import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { menuItems } from "@/lib/menu-items-v2";

export function MenuGrid() {
  return (
    <div className="grid grid-cols-3 gap-4 md:gap-6">
      {menuItems.map((item) => (
        <Link href={item.href} key={item.id}>
          <Card className="hover:bg-primary/20 transition-colors duration-200 aspect-square flex flex-col items-center justify-center p-4 border-2 border-transparent hover:border-purple-300 dark:border-gray-800 dark:hover:border-purple-500 shadow-lg rounded-2xl">
            <CardContent className="p-0 flex flex-col items-center justify-center gap-2">
              <item.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <p className="text-xs text-center font-semibold text-foreground">
                {item.title}
              </p>
              {item.comingSoon && (
                <p className="text-xs text-red-500 font-bold">
                  COMING SOON
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
