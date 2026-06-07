"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Send, Maximize2, MoreVertical } from "lucide-react";
import { User } from "@prisma/client";
import { InviteTeamDialog } from "../InviteTeamDialog";

interface TeamSummaryWidgetProps {
  data: {
    members: User[];
    currentCount: number;
    maxAllowed: number | null;
  };
}

export function TeamSummaryWidget({ data }: TeamSummaryWidgetProps) {
  // Helper to extract member name initials for the Avatar fallback
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <Card className="flex flex-col h-full w-80 shrink-0">
      <div>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              Equipa ({data.currentCount})
            </CardTitle>
            <div className="flex items-center gap-1">
              <InviteTeamDialog>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </InviteTeamDialog>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
            # membros: {data.currentCount}/
            {data.maxAllowed === null ? "Ilimitado" : data.maxAllowed}
          </p>
        </CardHeader>

        <CardContent className="pt-0 px-4">
          <ScrollArea className="h-52.5 pr-2">
            {data.members.length === 0 ? (
              <div className="flex h-45 items-center justify-center">
                <span className="text-xs text-slate-400 dark:text-slate-600">
                  Nenhum membro na equipa.
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {data.members.map((member) => {
                  const initials = getInitials(member.name);
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-3 py-2 border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                    >
                      {/* Avatar */}
                      <Avatar className="h-9 w-9 border border-slate-100 dark:border-slate-800 shrink-0">
                        {/* Assuming there's no avatar image in schema, we fall back to initials */}
                        <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      {/* Member Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {member.name || "Membro da Equipa"}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate font-medium">
                          {member.email}
                        </p>
                      </div>

                      {/* Action Menu */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 shrink-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </div>
    </Card>
  );
}

