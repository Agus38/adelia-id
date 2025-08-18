import { MenuGrid } from "@/components/menu-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Beranda</h2>
      </div>
      <MenuGrid />
    </div>
  );
}
