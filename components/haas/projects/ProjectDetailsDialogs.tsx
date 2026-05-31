"use client";

import { useProjectStore } from "@/hooks/useProjectStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProjectExperimentsView } from "@/components/haas/dashboard/ProjectExperimentsView";
import { ProjectEquipmentView } from "@/components/haas/dashboard/ProjectEquipmentView";


export function ProjectDetailsDialogs() {
  const { activeDetailView, activeProjectId, closeDetailView } = useProjectStore();

  if (!activeProjectId || !activeDetailView) return null;

  const isOpen = activeDetailView !== null;

  let title = "";
  let description = "";

  if (activeDetailView === 'EXPERIMENTS') {
    title = "Experiências do Projeto";
    description = "Lista de todas as experiências associadas a este projeto.";
  } else if (activeDetailView === 'ALERTS') {
    title = "Histórico de Alertas";
    description = "Registo de alertas gerados pelos equipamentos deste projeto.";
  } else if (activeDetailView === 'DEVICES') {
    title = "Equipamentos Alocados";
    description = "Sensores e gateways atualmente em uso neste projeto.";
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDetailView()}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pr-2">
          {activeDetailView === 'EXPERIMENTS' && (
            <ProjectExperimentsView projectId={activeProjectId} />
          )}
          {activeDetailView === 'ALERTS' && (
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
              [Tabela de Alertas]
            </div>
          )}
          {activeDetailView === 'DEVICES' && (
            <ProjectEquipmentView projectId={activeProjectId} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
