import { MenuGrid } from "@/components/menu-grid";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Top Banner */}
      <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden shadow-lg mb-8">
        <Image
          src="https://placehold.co/1200x400.png"
          alt="Promotional Banner"
          layout="fill"
          objectFit="cover"
          data-ai-hint="promotional banner"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-white">
          <h2 className="text-3xl md:text-4xl font-bold">Solusi Inovatif</h2>
          <p className="text-center mt-2 md:text-lg">Tingkatkan produktivitas bisnis Anda dengan alat canggih kami.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold">Adelia-ID</h1>
        <div className="mt-2 h-1.5 w-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
      </div>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <MenuGrid />
      </div>
    </div>
  );
}
