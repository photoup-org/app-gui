"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Filter, ExternalLink, MoreVertical, Terminal } from "lucide-react";
import { SystemLogWithUser } from "@/lib/data/system";

interface SystemLogsWidgetProps {
  data: {
    logs: SystemLogWithUser[];
    total: number;
  };
}

export function SystemLogsWidget({ data }: SystemLogsWidgetProps) {
  // Helper to format Date: DD/MM/YYYY - HH:mm
  const formatLogDate = (dateVal: Date | string) => {
    const d = new Date(dateVal);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  };

  return (
    <Card className="flex flex-col h-full w-full mb-0">
      <div>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
            Logs ({data.total})
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0 px-4">
          <ScrollArea className="h-[180px] pr-2">
            {data.logs.length === 0 ? (
              <div className="flex h-[150px] items-center justify-center">
                <span className="text-xs text-slate-400 dark:text-slate-600">
                  Nenhum log registado.
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {data.logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between gap-3 py-2 border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                  >
                    {/* Left Icon */}
                    <div className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 rounded-xl p-2.5 flex items-center justify-center h-9 w-9 shrink-0">
                      <Terminal className="h-4.5 w-4.5" />
                    </div>

                    {/* Middle Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-snug wrap-break-word">
                        {log.description}
                        {log.user && (
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            {" "}
                            ({log.user.name || log.user.email})
                          </span>
                        )}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-medium">
                        {formatLogDate(log.createdAt)}
                      </span>
                    </div>

                    {/* Right Action & Badge */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge
                        variant="secondary"
                        className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-0 text-[10px] font-bold px-2 py-0.5 hover:bg-indigo-100/50 dark:hover:bg-indigo-950"
                      >
                        Info
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </div>

      <CardFooter className="pt-2 pb-4 flex items-center justify-center border-t border-slate-50 dark:border-slate-800/60">
        <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400"></span>
          </span>
          A ouvir logs
        </div>
      </CardFooter>
    </Card>
  );
}
