import { MenuGrid } from "@/components/menu-grid";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col md:flex-row gap-8">
      {/* Main Content */}
      <div className="w-full md:w-2/3 flex flex-col">
        <div className="flex flex-col items-center justify-center p-4 pt-8">
          <h1 className="text-4xl font-bold">Adelia-ID</h1>
          <div className="mt-2 h-1.5 w-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
        </div>
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <MenuGrid />
        </div>
      </div>

      {/* Side Banner */}
      <div className="w-full md:w-1/3 flex items-center justify-center p-4">
        <div className="relative w-full h-full min-h-[300px] md:min-h-0 rounded-lg overflow-hidden shadow-lg">
           <Image
            src="https://placehold.co/600x800.png"
            alt="Promotional Banner"
            layout="fill"
            objectFit="cover"
            data-ai-hint="promotional banner"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-end p-6 text-white">
            <h2 className="text-2xl font-bold">Solusi Inovatif</h2>
            <p className="text-center mt-2">Tingkatkan produktivitas bisnis Anda dengan alat canggih kami.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
