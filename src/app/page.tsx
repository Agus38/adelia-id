
'use client'

import { MenuGrid } from "@/components/menu-grid";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay"
import * as React from "react"


const carouselSlides = [
  {
    title: "Solusi Inovatif",
    description: "Tingkatkan produktivitas bisnis Anda dengan alat canggih kami.",
    image: "https://placehold.co/1200x200.png",
    hint: "promotional banner"
  },
  {
    title: "Analitik Cerdas",
    description: "Dapatkan wawasan mendalam dari data Anda dengan dasbor interaktif.",
    image: "https://placehold.co/1200x200.png",
    hint: "data analytics"
  },
  {
    title: "Asisten AI Nexus",
    description: "Biarkan AI membantu Anda menyelesaikan tugas lebih cepat dan efisien.",
    image: "https://placehold.co/1200x200.png",
    hint: "artificial intelligence"
  }
]

export default function Home() {
    const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  )

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Banner Carousel */}
      <div className="mb-8">
        <Carousel 
          plugins={[plugin.current]}
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {carouselSlides.map((slide, index) => (
              <CarouselItem key={index}>
                 <div className="relative w-full h-48 md:h-52 rounded-lg overflow-hidden shadow-lg">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint={slide.hint}
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-white">
                      <h2 className="text-3xl md:text-4xl font-bold">{slide.title}</h2>
                      <p className="text-center mt-2 md:text-lg">{slide.description}</p>
                    </div>
                  </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
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
