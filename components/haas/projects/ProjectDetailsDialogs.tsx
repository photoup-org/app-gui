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


import { ProjectAlertsView } from "@/components/haas/dashboard/ProjectAlertsView";

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
    description = "Registo de alertas gerados pelas experiências deste projeto.";
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
            <ProjectAlertsView projectId={activeProjectId} />
          )}
          {activeDetailView === 'DEVICES' && (
            <ProjectEquipmentView projectId={activeProjectId} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
