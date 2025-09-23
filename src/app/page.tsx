

'use client'

import { MenuGrid } from "@/components/menu-grid";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay"
import * as React from "react"
import { useBannerConfig } from "@/lib/menu-store";
import { Skeleton } from "@/components/ui/skeleton";


export default function Home() {
    const { bannerSlides, isLoading } = useBannerConfig();
    const plugin = React.useRef(
      Autoplay({ delay: 4000, stopOnInteraction: true })
    )
    const [api, setApi] = React.useState<CarouselApi>()
    const [current, setCurrent] = React.useState(0)
 
    React.useEffect(() => {
      if (!api) {
        return
      }
 
      setCurrent(api.selectedScrollSnap())
 
      const onSelect = (api: CarouselApi) => {
        setCurrent(api.selectedScrollSnap())
      }

      api.on("select", onSelect)
 
      return () => {
        api.off("select", onSelect)
      }
    }, [api])

    const visibleSlides = bannerSlides.filter(slide => slide.visible);


  return (
    <div className="flex-1 flex flex-col p-4 md:p-6">
    {/* Top Banner Carousel */}
    <div className="mb-4">
        {isLoading ? (
             <Skeleton className="w-full h-28 md:h-36 rounded-lg" />
        ) : (
            <Carousel 
            setApi={setApi}
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
                {visibleSlides.map((slide, index) => (
                <CarouselItem key={index}>
                    <div className="relative w-full h-28 md:h-36 rounded-lg overflow-hidden shadow-lg">
                        <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
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
        )}
        {!isLoading && (
            <div className="flex justify-center gap-2 mt-2">
                {visibleSlides.map((_, index) => (
                <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={`h-2 w-2 rounded-full transition-colors ${
                    current === index ? 'bg-primary' : 'bg-muted'
                    }`}
                />
                ))}
            </div>
        )}
    </div>

    <div className="flex-1 space-y-4 pt-6 md:pt-8">
        <MenuGrid />
    </div>
    </div>
  );
}
