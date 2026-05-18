"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Router, Wifi } from "lucide-react";
import { GatewaySummary } from "@/lib/data/overview";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface GatewaySummaryWidgetProps {
  gateways: GatewaySummary[];
}

export function GatewaySummaryWidget({ gateways }: GatewaySummaryWidgetProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  console.log(gateways)

  return (
    <Card className="flex flex-col h-full shrink-0 w-80">
      <CardHeader className="flex items-start justify-between">
        <CardTitle>
          {gateways.length > 0 ? <>
            <h6 className="font-bold">Gateway {current + 1}</h6>
            <span className="text-xs text-slate-400">...{gateways[current].id.slice(-8)}</span>
          </> : "Gateways"}

        </CardTitle>
        <div className="flex gap-1">
          <Wifi className="text-success" />
          <Button variant={"ghost"} size={"icon"}>
            <MoreVertical />
          </Button>

        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-0 px-0">
        {gateways.length === 0 ? (
          <div className="flex-1 flex items-center justify-center px-6 pt-4">
            <span className="text-sm text-muted-foreground">Nenhum gateway registado</span>
          </div>
        ) : (
          <Carousel setApi={setApi} className="w-full flex flex-col">
            <CarouselContent className="flex-1 ml-0 px-4">
              {gateways.map((gateway) => (
                <CarouselItem key={gateway.id} className="pl-0 basis-full min-h-full flex items-end justify-between">
                  <div className="flex flex-col text-slate-400 text-xs">
                    <p>Átivo há: 42 dias, 8h</p>
                    <p>Enderço MAC: 00:1A:2B:3C:4D:5E</p>
                    <p>IP Local: 192.168.1.50</p>
                    <p>Versão do Firmware: v7.04.1</p>
                  </div>
                  <div className="flex flex-col text-primary text-right font-bold">
                    <h6 className="font-bold text-6xl">{gateway.totalActiveNetworkSensors}</h6>
                    <span className="text-xs max-w-16 text-right">Sensores <br /> Registados</span>

                  </div>

                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </CardContent>

      {/* Pagination Dots */}
      {gateways.length > 1 && (
        <CardFooter className="flex items-center justify-center gap-2 pt-0 pb-6 border-0">
          {gateways.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Ir para gateway ${index + 1}`}
              className={cn(
                "rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                current === index
                  ? "bg-primary w-6 h-2.5"
                  : "bg-muted hover:bg-muted-foreground/50 w-2.5 h-2.5"
              )}
            />
          ))}
        </CardFooter>
      )}
    </Card>
  );
}
