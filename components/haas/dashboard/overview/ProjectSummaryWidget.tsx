"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, SquarePlus } from "lucide-react";
import { ProjectSummary } from "@/lib/data/overview";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/hooks/useProjectStore";
import { ProjectCard } from "@/components/haas/projects/ProjectCard";

interface ProjectSummaryWidgetProps {
  data: ProjectSummary;
}

export function ProjectSummaryWidget({ data }: ProjectSummaryWidgetProps) {
  const { openDialog } = useProjectStore();

  const hasProjects = data.totalProjects > 0;

  return (
    <Card className="flex flex-col h-full w-full mb-0">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-4">
        <CardTitle className="font-bold text-slate-900 dark:text-white">Os Meus Projetos ({data.totalProjects})</CardTitle>
        <Button className="text-primary" size={"icon"} variant={"ghost"} onClick={openDialog}>
          <SquarePlus />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 px-5 pb-5 overflow-hidden flex flex-col justify-center">
        {!hasProjects ? (
          <NoProjects />
        ) : <>
          {data.recentProjects.map((project) => (
            <div
              key={project.id}
              className="min-w-[340px] md:min-w-[420px] max-w-[480px] snap-center shrink-0"
            >
              <ProjectCard {...project} />
            </div>
          ))}
        </>}
      </CardContent>
    </Card>
  );
}

const NoProjects = () => {
  const { openDialog } = useProjectStore();

  return <div className="flex flex-col items-center justify-center">
    <FolderOpen className="w-10 h-10 text-slate-400" />
    <span className="text-slate-400 text-sm text-center max-w-3xs">Neste momento não tem nenhum projeto registado.</span>
    <Button variant="link" size="sm" className="mt-2 text-cyan-600 hover:text-cyan-700" onClick={openDialog}>
      Criar um projeto
    </Button>
  </div>
}