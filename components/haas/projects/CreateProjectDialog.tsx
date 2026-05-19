"use client";

import { useProjectStore } from "@/hooks/useProjectStore";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { ProjectForm } from "./ProjectForm";

export function CreateProjectDialog() {
  const { isOpen, setIsOpen } = useProjectStore();

  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Criar Novo Projeto"
      description="Defina as configurações iniciais para a sua nova experiência."
    >
      <div className="py-4">
        <ProjectForm />
      </div>
    </ResponsiveDialog>
  );
}
