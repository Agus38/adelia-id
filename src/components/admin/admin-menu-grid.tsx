import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { adminMenuItems } from "@/lib/menu-items-v2";

export function AdminMenuGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {adminMenuItems.map((item) => (
        <Link href={item.href} key={item.id}>
          <Card className="hover:bg-primary/20 transition-colors duration-200 flex flex-col items-center justify-center p-4 border-2 border-transparent hover:border-purple-300 dark:border-gray-800 dark:hover:border-purple-500 shadow-lg rounded-2xl min-h-[150px]">
            <CardContent className="p-0 flex flex-col items-center justify-center gap-2 text-center">
              <item.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <p className="text-sm font-semibold text-foreground mt-2">
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground px-2">
                {item.description}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
