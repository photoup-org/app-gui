"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreVertical, Edit, Trash2, Play } from "lucide-react";
import { toast } from "sonner";
import { Project } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { deleteProjectAction } from "@/actions/projects";
import { CreateProjectDialog } from "@/components/haas/projects/CreateProjectDialog";

interface ProjectActionsProps {
  projectId: string;
  project: Project;
}

export default function ProjectActions({ projectId, project }: ProjectActionsProps) {
  const router = useRouter();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteProjectAction(projectId);
      if (res.success) {
        toast.success("Projeto eliminado com sucesso.");
        router.push("/projects");
        router.refresh();
      } else {
        toast.error(res.error || "Falha ao eliminar o projeto.");
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 focus-visible:ring-1 focus-visible:ring-indigo-500">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 border-slate-200 dark:border-slate-800 shadow-sm">
          <DropdownMenuItem asChild>
            <Link href={`/projects/${projectId}/experiments/new`} className="cursor-pointer flex items-center font-medium">
              <Play className="mr-2 h-4 w-4 text-emerald-500" />
              <span>Nova Experiência</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
          <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)} className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4 text-indigo-500" />
            <span>Editar Projeto</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)} 
            className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-500 dark:focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Eliminar Projeto</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog via Reused Wizard */}
      <CreateProjectDialog 
        project={project} 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
      />

      {/* Delete Alert Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem a certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isto eliminará permanentemente o projeto
              <span className="font-semibold text-foreground"> {project.name} </span>
              e todos os dados associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {isDeleting ? "A eliminar..." : "Eliminar Projeto"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
