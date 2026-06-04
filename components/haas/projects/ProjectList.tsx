"use client";

import React, { useState } from 'react';
import { Search, FolderOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ProjectCard from './ProjectCard';

interface Project {
    id: string;
    name: string;
    description: string | null;
    status: "ACTIVE" | "ARCHIVED";
    _count: {
        experiments: number;
        devices: number;
    };
}

interface ProjectListProps {
    projects: Project[];
}

export default function ProjectList({ projects }: ProjectListProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredProjects = projects.filter((project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full flex flex-col items-center">
            {/* Search Input */}
            <div className="w-full max-w-lg mb-8 relative">
                <div className="relative flex items-center w-full">
                    <Search className="absolute left-3 w-5 h-5 text-slate-400" />
                    <Input
                        type="search"
                        placeholder="Pesquisar projetos..."
                        className="w-full pl-10 py-6 text-lg rounded-xl  border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-visible:ring-emerald-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid Container */}
            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <FolderOpen className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Sem Projetos</h3>
                    <p className="text-slate-500 max-w-md">
                        Ainda não tens nenhum projeto criado. Cria um para começares a organizar as tuas experiências.
                    </p>
                </div>
            ) : filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
                    {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Nenhum projeto encontrado</h3>
                    <p className="text-slate-500 max-w-md">
                        Não encontrámos nenhum projeto correspondente a &quot;{searchQuery}&quot;. Tente utilizar outros termos de pesquisa.
                    </p>
                </div>
            )}
        </div>
    );
}
