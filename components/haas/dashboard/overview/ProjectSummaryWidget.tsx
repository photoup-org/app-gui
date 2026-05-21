"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Maximize2, MoreVerticalIcon, SquarePlus } from "lucide-react";
import { ProjectSummary, RecentProject } from "@/lib/data/overview";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/hooks/useProjectStore";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn, getInitials } from "@/lib/utils";
import { useDeleteStore } from "@/hooks/useDeleteStore";
import { deleteProjectAction } from "@/actions/projects";

interface ProjectSummaryWidgetProps {
  data: ProjectSummary;
}

export function ProjectSummaryWidget({ data }: ProjectSummaryWidgetProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const hasProjects = data.totalProjects > 0;
  const activeProject = hasProjects ? data.recentProjects[selectedIndex] : null;

  if (!hasProjects || !activeProject) return <NoProjects />;

  return (
    <Card className="flex flex-col h-full w-full mb-0">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-4">
        <CardTitle className="font-bold text-slate-900 dark:text-white flex flex-col ">
          {activeProject.name}
          <p className="text-xs text-muted-foreground mt-1.5 whitespace-nowrap">
            Criado em {activeProject.createdAt} por{" "}
            <span className="text-teal-500 font-">
              {activeProject.authorName}
            </span>
          </p>
        </CardTitle>
        <div className="flex items-center gap-1 shrink-0">
          {activeProject.members && activeProject.members.length > 0 && (
            <MemberList members={activeProject.members} />
          )}
          <ProjectMenu id={activeProject.id} name={activeProject.name} />
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-5 pb-5 flex flex-col justify-between">

        <div className="grid grid-cols-3 gap-4">
          <ProjectSummaryParamCard
            stat={activeProject.stats.experiments}
            title="Experiências"
            bgColor="bg-primary/10 hover:bg-primary/20"
            textColor="text-primary"
          />
          <ProjectSummaryParamCard
            stat={activeProject.stats.alerts}
            title="Alertas"
            bgColor={
              activeProject.stats.alerts > 0
                ? "bg-red-500/10 hover:bg-red-500/20 dark:bg-red-500/20 dark:hover:bg-red-500/30"
                : "bg-slate-500/10 hover:bg-slate-500/20 dark:bg-slate-400/10 dark:hover:bg-slate-400/20"
            }
            textColor={
              activeProject.stats.alerts > 0
                ? "text-red-600 dark:text-red-400"
                : "text-slate-500 dark:text-slate-400"
            }
          />
          <ProjectSummaryParamCard
            stat={activeProject.stats.sensors}
            title="Sensores"
            bgColor="bg-disp-gateway/10 hover:bg-disp-gateway/20"
            textColor="text-disp-gateway"
          />
        </div>
        {data.recentProjects.length > 1 && (

          <div className="flex justify-center items-center gap-1.5 mt-3 mb-0">
            {data.recentProjects.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${index === selectedIndex
                  ? "bg-teal-500"
                  : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300"
                  }`}
                aria-label={`Ver projeto ${index + 1}`}
              />
            ))}
          </div>
        )}


      </CardContent>

    </Card>
  );
}

const MemberList = ({ members }: { members: RecentProject["members"] }) => {
  return <AvatarGroup className="mr-2">
    {members.slice(0, 4).map((member, idx) => (
      <Avatar
        key={idx}
        className="border-2 border-white ring-0 size-8 shadow-sm"
        data-slot="avatar"
      >
        {member.image && (
          <AvatarImage src={member.image} alt={member.name} />
        )}
        <AvatarFallback className="bg-slate-100 text-slate-700 text-xs font-semibold">
          {getInitials(member.name)}
        </AvatarFallback>
      </Avatar>
    ))}
    {members.length > 4 && (
      <AvatarGroupCount className="bg-slate-100 text-slate-600 text-[11px] font-bold size-8 border-2 border-white shadow-sm flex items-center justify-center rounded-full shrink-0">
        +{members.length - 4}
      </AvatarGroupCount>
    )}
  </AvatarGroup>
}

const ProjectSummaryParamCard = ({
  stat,
  title,
  bgColor,
  textColor,
}: {
  stat: number;
  title: string;
  bgColor: string;
  textColor: string;
}) => {
  const handleAction = (actionName: string) => {
    toast.info(`Ação "${actionName}" foi efetuada com sucesso.`);
  };
  return (
    <div
      className={cn(
        "relative rounded-2xl p-3.5 h-24 flex flex-col justify-between transition-all duration-300 cursor-pointer group/metric",
        bgColor
      )}
      onClick={() => handleAction(`Ver ${title}`)}
    >
      <div className="flex justify-between items-center w-full">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
          {title}
        </span>
        <Maximize2 className={cn("w-3.5 h-3.5 transition-colors", textColor)} />
      </div>
      <span
        className={cn(
          "text-4xl font-light text-right w-full tracking-tight select-none transition-colors",
          textColor
        )}
      >
        {stat}
      </span>
    </div>
  );
}

const ProjectMenu = ({ id, name }: { id: string, name: string }) => {
  const { openDelete } = useDeleteStore();

  const handleAction = (actionName: string) => {
    toast.info(`Ação "${actionName}" para o projeto: ${name}`);
  };

  const handleDeleteClick = () => {
    openDelete({
      title: "Eliminar Projeto?",
      description: `Tem a certeza que deseja eliminar o projeto "${name}"? Esta ação é irreversível e apagará todos os dados associados, devolvendo os equipamentos ao inventário.`,
      action: async () => {
        const res = await deleteProjectAction(id);
        if (res.success) {
          toast.success("Projeto eliminado com sucesso.");
        } else {
          toast.error(res.error);
        }
      }
    });
  };


  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant={"ghost"}
        size={"icon"}
        className="rounded-full"
      >
        <MoreVerticalIcon className="w-5 h-5 cursor-pointer" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-40 rounded-xl">
      <DropdownMenuItem onClick={() => handleAction("Ver Detalhes")}>
        Ver Detalhes
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleAction("Configurações")}>
        Configurações
      </DropdownMenuItem>
      <DropdownMenuItem
        className="text-destructive focus:text-destructive"
        onClick={handleDeleteClick}
      >
        Eliminar
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
}


const NoProjects = () => {
  const { openDialog } = useProjectStore();
  return (
    <Card className="flex flex-col h-full w-full mb-0">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-4">
        <CardTitle className="font-bold text-slate-900 dark:text-white">
          Os Meus Projetos
        </CardTitle>
        <Button className="text-primary" size={"icon"} variant={"ghost"} onClick={openDialog}>
          <SquarePlus />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 px-5 pb-5 flex flex-col justify-center items-center ">
        <FolderOpen className="w-10 h-10 text-slate-400" />
        <span className="text-slate-400 text-sm text-center max-w-[250px] mt-2">
          Neste momento não tem nenhum projeto registado.
        </span>
        <Button variant="link" size="sm" className="mt-2 text-cyan-600 hover:text-cyan-700" onClick={openDialog}>
          Criar um projeto
        </Button>
      </CardContent>
    </Card>

  );
}