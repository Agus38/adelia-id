import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { adminMenuItems } from "@/lib/menu-items-v2";

export function AdminMenuGrid() {
  const items = adminMenuItems.filter(item => item.id !== 'admin-dashboard');
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <Link href={item.href} key={item.id}>
          <Card className="hover:border-primary transition-colors duration-200 shadow-sm h-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                 <div className="bg-primary/10 p-3 rounded-md">
                    <item.icon className="h-6 w-6 text-primary" />
                 </div>
                 <CardTitle className="text-lg">{item.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {item.description}
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
