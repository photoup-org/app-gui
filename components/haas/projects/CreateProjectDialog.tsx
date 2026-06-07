"use client";

import { useProjectStore } from "@/hooks/useProjectStore";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { ProjectWizard } from "@/app/(HaaS)/projects/_components/ProjectWizard";

interface CreateProjectDialogProps {
  project?: any;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateProjectDialog({ project, open, onOpenChange }: CreateProjectDialogProps) {
  const { isOpen, setIsOpen } = useProjectStore();

  const isEditMode = !!project;
  const isControlled = open !== undefined && onOpenChange !== undefined;

  const dialogOpen = isControlled ? open : isOpen;
  const handleOpenChange = isControlled ? onOpenChange : setIsOpen;

  const onDialogChange = (newOpen: boolean) => {
    if (handleOpenChange) handleOpenChange(newOpen);
    if (!newOpen) {
      // Delay reset slightly to let the closing animation finish
      setTimeout(() => useProjectStore.getState().resetWizard(), 300);
    }
  };

  return (
    <ResponsiveDialog
      open={dialogOpen}
      onOpenChange={onDialogChange}
      title={isEditMode ? "Editar Projeto" : "Criar Novo Projeto"}
      description={isEditMode ? "Siga os passos para atualizar o seu projeto." : "Siga os 5 passos para definir e inicializar o seu novo projeto."}
      className="sm:max-w-[600px]"
    >
      <div className="py-2">
        <ProjectWizard initialData={project} onSuccess={() => handleOpenChange(false)} />
      </div>
    </ResponsiveDialog>
  );
}
