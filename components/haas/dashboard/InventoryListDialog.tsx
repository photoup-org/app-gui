"use client";

import { useInventoryDialogStore } from "@/hooks/useInventoryDialogStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export function InventoryListDialog() {
  const { activeCategory, closeDialog } = useInventoryDialogStore();

  const isOpen = activeCategory !== null;

  let title = "";
  let badgeVariant: "default" | "secondary" | "destructive" = "default";

  if (activeCategory === 'OFFLINE') {
    title = "Sensores Offline";
    badgeVariant = "secondary";
  } else if (activeCategory === 'ACTIVE') {
    title = "Sensores em Utilização";
    badgeVariant = "default"; // Matches blue/teal
  } else if (activeCategory === 'MAINTENANCE') {
    title = "Sensores em Manutenção";
    badgeVariant = "destructive"; // Matches red
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{title}</DialogTitle>
            <Badge variant={badgeVariant} className="text-[10px] uppercase">
              {activeCategory}
            </Badge>
          </div>
          <DialogDescription>
            Lista de todos os equipamentos atualmente com este estado no inventário.
          </DialogDescription>
        </DialogHeader>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pr-2 mt-2">
           <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/20">
              [Tabela de Equipamentos {activeCategory} - A ser implementada]
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
