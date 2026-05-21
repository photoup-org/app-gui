"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { Maximize2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";
import { useDeleteStore } from "@/hooks/useDeleteStore";
import { deleteProjectAction } from "@/actions/projects";

export interface ProjectCardProps {
  id: string;
  name: string;
  createdAt: string; // pre-formatted pt-PT string
  authorName: string;
  members: { name: string; email?: string; image?: string | null }[];
  stats: {
    experiments: number;
    alerts: number;
    sensors: number;
  };
}

export function ProjectCard({
  id,
  name,
  createdAt,
  authorName,
  members,
  stats,
}: ProjectCardProps) {
  const handleAction = (actionName: string) => {
    toast.info(`Ação "${actionName}" para o projeto: ${name}`);
  };

  const { openDelete } = useDeleteStore();

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

  return (
    <Card className="p-5 md:p-6 flex flex-col justify-between gap-5 ">
      {/* Step 2: The Header Area */}
      <div className="flex justify-between items-start w-full gap-4">
        {/* Left Side (Text) */}
        <div className="flex flex-col min-w-0">
          <h3
            className="text-lg font-bold text-slate-900 truncate max-w-[200px] sm:max-w-[280px] hover:text-slate-800 transition-colors"
            title={name}
          >
            {name}
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 whitespace-nowrap">
            Created at {createdAt} by{" "}
            <span className="text-teal-500 font-medium hover:underline cursor-pointer">
              {authorName}
            </span>
          </p>
        </div>

        {/* Right Side (Avatars & Menu) */}
        <div className="flex items-center gap-1 shrink-0">
          {members && members.length > 0 && (
            <AvatarGroup className="mr-2">
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
          )}

          {/* More actions dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors focus-visible:outline-none">
                <MoreVertical className="w-5 h-5 cursor-pointer" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
              <DropdownMenuItem onClick={() => handleAction("Ver Detalhes")} className="cursor-pointer">
                Ver Detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("Configurações")} className="cursor-pointer">
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={handleDeleteClick}
              >
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Step 3: The Metrics Area (Three Blocks) */}
      <div className="grid grid-cols-3 gap-4 mt-2">
        {/* Block 1 (Experiências) */}
        <div
          className="relative rounded-2xl p-3.5 h-24 flex flex-col justify-between bg-teal-50/50 border border-teal-100/50 hover:bg-teal-50/80 hover:border-teal-100 transition-all duration-300 cursor-pointer shadow-[0_2px_8px_rgba(20,184,166,0.02)] group/metric"
          onClick={() => handleAction("Ver Experiências")}
        >
          <div className="flex justify-between items-center w-full">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
              Experiências
            </span>
            <Maximize2 className="w-3.5 h-3.5 text-teal-400 hover:text-teal-500 transition-colors duration-200" />
          </div>
          <span className="text-4xl text-teal-500 font-light text-right w-full tracking-tight select-none">
            {stats.experiments}
          </span>
        </div>

        {/* Block 2 (Alertas) */}
        <div
          className="relative rounded-2xl p-3.5 h-24 flex flex-col justify-between bg-slate-100 border border-slate-200/40 hover:bg-slate-200/50 hover:border-slate-200 transition-all duration-300 cursor-pointer group/metric"
          onClick={() => handleAction("Ver Alertas")}
        >
          <div className="flex justify-between items-center w-full">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Alertas
            </span>
            <Maximize2 className="w-3.5 h-3.5 text-slate-400 hover:text-slate-500 transition-colors duration-200" />
          </div>
          <span className="text-4xl text-slate-400 font-light text-right w-full tracking-tight select-none">
            {stats.alerts}
          </span>
        </div>

        {/* Block 3 (Sensores) */}
        <div
          className="relative rounded-2xl p-3.5 h-24 flex flex-col justify-between bg-indigo-50/50 border border-indigo-100/50 hover:bg-indigo-50/80 hover:border-indigo-100 transition-all duration-300 cursor-pointer shadow-[0_2px_8px_rgba(99,102,241,0.02)] group/metric"
          onClick={() => handleAction("Ver Sensores")}
        >
          <div className="flex justify-between items-center w-full">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              Sensores
            </span>
            <Maximize2 className="w-3.5 h-3.5 text-indigo-400 hover:text-indigo-500 transition-colors duration-200" />
          </div>
          <span className="text-4xl text-indigo-500 font-light text-right w-full tracking-tight select-none">
            {stats.sensors}
          </span>
        </div>
      </div>

      {/* Step 4: Pagination Dots (Footer) */}
      <div className="flex justify-center gap-1.5 mt-2 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 transition-all duration-300" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-200 transition-all duration-300" />
      </div>
    </Card>
  );
}
