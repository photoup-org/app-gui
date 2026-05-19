"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";

export function CreateProjectDialog() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Check if the URL contains ?newProject=true
  const isOpen = searchParams.get("newProject") === "true";

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Create a new URLSearchParams object to safely remove ONLY the newProject param
      // This preserves other params like pagination (e.g., ?calibrationPage=2)
      const params = new URLSearchParams(searchParams.toString());
      params.delete("newProject");
      
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.push(newUrl, { scroll: false });
    }
  };

  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      title="Criar Novo Projeto"
      description="Defina as configurações iniciais para a sua nova experiência."
    >
      <div className="py-6 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 text-slate-500">
        Formulário de Criação de Projeto (Em breve)
      </div>
    </ResponsiveDialog>
  );
}
