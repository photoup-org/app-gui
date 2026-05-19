"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wifi, Router } from "lucide-react";
import { cn } from "@/lib/utils";
import { NetworkTestIlustration } from "@/components/resources/ilustrations";

interface NetworkTestWidgetProps {
  isReady: boolean;
}

export function NetworkTestWidget({ isReady }: NetworkTestWidgetProps) {
  return (
    <Card className="flex flex-col h-full w-80  shrink-0 mb-0">
      <CardHeader className="pb-0">
        <CardTitle >Teste de Rede</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pt-0 px-4 pb-4 items-center">
        <NetworkTestIlustration width={120} />

        {/* Action Button */}
        <Button
          disabled={!isReady}
          className={cn(
            isReady
              ? "bg-teal-500 hover:bg-teal-600 text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
          )}
        >
          {isReady ? "Realizar Teste" : "Nenhum Gateway Detetado"}
        </Button>
      </CardContent>
    </Card>
  );
}
