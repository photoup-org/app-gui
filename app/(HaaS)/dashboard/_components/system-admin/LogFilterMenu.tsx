"use client";

import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type LogLevel = "INFO" | "WARN" | "ERROR" | "CRITICAL";

interface LogFilterMenuProps {
  selectedLevels: LogLevel[];
  onLevelsChange: (levels: LogLevel[]) => void;
}

export function LogFilterMenu({ selectedLevels, onLevelsChange }: LogFilterMenuProps) {
  const toggleLevel = (level: LogLevel) => {
    if (selectedLevels.includes(level)) {
      onLevelsChange(selectedLevels.filter((l) => l !== level));
    } else {
      onLevelsChange([...selectedLevels, level]);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Filtrar por Nível</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={selectedLevels.includes("INFO")}
          onCheckedChange={() => toggleLevel("INFO")}
        >
          Informação (Info)
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={selectedLevels.includes("WARN")}
          onCheckedChange={() => toggleLevel("WARN")}
        >
          Aviso (Warning)
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={selectedLevels.includes("ERROR")}
          onCheckedChange={() => {
            if (selectedLevels.includes("ERROR")) {
              onLevelsChange(selectedLevels.filter((l) => l !== "ERROR" && l !== "CRITICAL"));
            } else {
              onLevelsChange([...selectedLevels, "ERROR", "CRITICAL"]);
            }
          }}
        >
          Erro (Error/Critical)
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
