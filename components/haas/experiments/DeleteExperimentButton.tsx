"use client";

import { useTransition } from "react";
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle, 
    AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteExperimentAction } from "@/app/(HaaS)/projects/[projectId]/experiments/actions";
import { toast } from "sonner";

interface DeleteExperimentButtonProps {
    experimentId: string;
    projectId: string;
    disabled: boolean;
}

export function DeleteExperimentButton({ experimentId, projectId, disabled }: DeleteExperimentButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteExperimentAction(experimentId, projectId);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Experiência apagada com sucesso.");
            }
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <div title={disabled ? "Não é possível apagar uma experiência ativa. Termine ou aborte primeiro." : "Apagar experiência"}>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        disabled={disabled || isPending}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 dark:hover:bg-red-950 dark:border-red-900/50"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Tem a certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isto irá apagar permanentemente a experiência e todas as leituras de sensores associadas da base de dados.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        disabled={isPending}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isPending ? "A apagar..." : "Sim, apagar experiência"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
