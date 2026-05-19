"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, SquarePlus } from "lucide-react";
import { ProjectSummary, RecentProject } from "@/lib/data/overview";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/hooks/useProjectStore";

interface ProjectSummaryWidgetProps {
  data: ProjectSummary;
}

function getProjectBadge(project: RecentProject) {
  if (project.activeExperimentsCount > 0) {
    return (
      <Badge variant="outline" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-transparent dark:bg-emerald-500/20 dark:text-emerald-400">
        A decorrer
      </Badge>
    );
  }

  if (project.status === "PLANNED") {
    return (
      <Badge variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-transparent dark:bg-blue-500/20 dark:text-blue-400">
        Planeado
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-transparent dark:bg-slate-800 dark:text-slate-400">
      Concluído
    </Badge>
  );
}

export function ProjectSummaryWidget({ data }: ProjectSummaryWidgetProps) {
  const { openDialog } = useProjectStore();

  return (
    <Card className="flex flex-col h-full w-full mb-0">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-4">
        <CardTitle className="font-bold text-slate-900 dark:text-white">Os Meus Projetos ({data.totalProjects})</CardTitle>
        <Button className="text-primary" size={"icon"} variant={"ghost"} onClick={openDialog}>
          <SquarePlus />
        </Button>
      </CardHeader>
      <CardContent>
        {data.totalProjects === 0 ? (
          <NoProjects />
        ) : (""

        )}
      </CardContent>
    </Card>
  );
}


const NoProjects = () => {
  const { openDialog } = useProjectStore();

  return <div className="flex flex-col items-center justify-center py-4">
    <FolderOpen className="w-10 h-10 text-slate-400" />
    <span className="text-slate-400 text-sm text-center mt-2 max-w-3xs">Neste momento não tem nenhum projeto registado.</span>
    <Button variant="link" size="sm" className="mt-2 text-cyan-600 hover:text-cyan-700" onClick={openDialog}>
      Criar um projeto
    </Button>
  </div>
}