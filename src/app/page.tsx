import { MenuGrid } from "@/components/menu-grid";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center p-2 text-sm">
        <p>Jangan pernah menyerah karena biasanya itu adalah ku</p>
      </div>
      <div className="flex flex-col items-center justify-center p-4 pt-8">
        <h1 className="text-4xl font-bold">Adelia-ID</h1>
        <div className="mt-2 h-1.5 w-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
      </div>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <MenuGrid />
      </div>
    </div>
  );
}
