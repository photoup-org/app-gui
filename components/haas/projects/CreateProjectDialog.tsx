"use client";

import { useProjectStore } from "@/hooks/useProjectStore";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { ProjectWizard } from "./ProjectWizard";

export function CreateProjectDialog() {
  const { isOpen, setIsOpen } = useProjectStore();

  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Criar Novo Projeto"
      description="Siga os 5 passos para definir e inicializar o seu novo projeto."
      className="sm:max-w-[600px]"
    >
      <div className="py-2">
        <ProjectWizard />
      </div>
    </ResponsiveDialog>
  );
}
