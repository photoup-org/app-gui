"use client"

import * as React from "react"
import { PlayCircle } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type Guide = {
  id: string;
  title: string;
  description: string;
  sensorName: string;
}

const GUIDES: Guide[] = [
  {
    id: "gw-1",
    title: "Como reclamar o seu Gateway",
    description: "Aprenda a ligar o seu gateway à rede e a registá-lo na sua conta.",
    sensorName: "Gateway",
  },
  {
    id: "ph-1",
    title: "Instalação do Sensor de pH",
    description: "Guia passo-a-passo para calibrar e instalar o sensor de pH no bioreator.",
    sensorName: "Sensor de pH",
  },
  {
    id: "temp-1",
    title: "Instalação do Sensor de Temperatura",
    description: "Como posicionar corretamente a sonda de temperatura para leituras precisas.",
    sensorName: "Sensor de Temp.",
  }
];

export function InstallationGuidesCarousel() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)
  const [selectedGuide, setSelectedGuide] = React.useState<Guide>(GUIDES[0])


  React.useEffect(() => {
    if (!api) return
    console.log(api)
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  return <Card className="h-full w-80 shrink-0 ">
    <CardHeader>
      <CardTitle>Guia de Instalação</CardTitle>
      <CardDescription>{selectedGuide.title}</CardDescription>
    </CardHeader>
    <CardContent>
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {GUIDES.map((guide) => (
            <CarouselItem key={guide.id} className="flex flex-col">
              {/* Video Placeholder */}
              <div className="aspect-video w-full rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors group relative overflow-hidden">
                <PlayCircle className="w-12 h-12 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" strokeWidth={1.5} />
              </div>

            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </CardContent>
    <CardFooter className="flex items-center justify-center gap-2 mt-1 bg-card border-0">
      {GUIDES.map((guide, index) => (
        <button
          key={guide.id}
          onClick={() => {
            api?.scrollTo(index)
            setSelectedGuide(guide)
          }}
          title={guide.sensorName}
          aria-label={`Ir para guia do ${guide.sensorName}`}
          className={cn(
            "rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            current === index
              ? "bg-primary w-6 h-3"
              : "bg-muted hover:bg-muted-foreground/50 w-3 h-3"
          )}
        />
      ))}
    </CardFooter>
  </Card>
}


//  <div className="flex flex-col gap-4 rounded-xl border-2 border-border bg-card p-5 h-full w-80 shrink-0 justify-between">
//       <div className="flex flex-col gap-3">
//         <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Guia de Instalação</h3>
//         <Carousel setApi={setApi} className="w-full">
//           <CarouselContent>
//             {GUIDES.map((guide) => (
//               <CarouselItem key={guide.id} className="flex flex-col">
//                 {/* Video Placeholder */}
//                 <div className="aspect-video w-full rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors group relative overflow-hidden">
//                   <PlayCircle className="w-12 h-12 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" strokeWidth={1.5} />
//                 </div>
//                 {/* Text Content */}
//                 <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 mb-1">{guide.title}</h4>
//                 {/* <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{guide.description}</p> */}
//               </CarouselItem>
//             ))}
//           </CarouselContent>
//         </Carousel>
//       </div>

//       {/* Custom Dot Pagination */}
//       <div className="flex items-center justify-center gap-2 mt-1">
//         {GUIDES.map((guide, index) => (
//           <button
//             key={guide.id}
//             onClick={() => api?.scrollTo(index)}
//             title={guide.sensorName}
//             aria-label={`Ir para guia do ${guide.sensorName}`}
//             className={cn(
//               "rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
//               current === index
//                 ? "bg-primary w-6 h-3"
//                 : "bg-muted hover:bg-muted-foreground/50 w-3 h-3"
//             )}
//           />
//         ))}
//       </div>
//     </div>