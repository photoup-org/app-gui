"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createExperimentAction } from "../actions";
import { createExperimentSchema, CreateExperimentFormValues } from "../validations";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { CalendarIcon, CheckCircle2, Loader2, Radio, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface NewExperimentFormProps {
    projectId: string;
    devices: any[]; // Using any[] here to simplify, realistically it would be a Prisma generated type
}

export default function NewExperimentForm({ projectId, devices }: NewExperimentFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<CreateExperimentFormValues>({
        resolver: zodResolver(createExperimentSchema),
        defaultValues: {
            name: "",
            startDate: new Date(),
            endDate: null,
            deviceIds: [],
        },
    });

    function onSubmit(data: CreateExperimentFormValues) {
        startTransition(async () => {
            const result = await createExperimentAction(projectId, data);
            
            if (result.success && result.experimentId) {
                toast.success("Experiência criada com sucesso!");
                router.push(`/projects/${projectId}/experiments/${result.experimentId}`);
            } else {
                toast.error(result.error || "Ocorreu um erro ao criar a experiência.");
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Basic Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="col-span-1 md:col-span-2">
                                <FormLabel className="text-slate-900 dark:text-slate-100 font-semibold">Nome da Experiência</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Lote 04 - Estudo Cinético" {...field} className="bg-slate-50 dark:bg-slate-900/50" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel className="text-slate-900 dark:text-slate-100 font-semibold">Data de Início</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal bg-slate-50 dark:bg-slate-900/50",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP", { locale: pt })
                                                ) : (
                                                    <span>Selecione uma data</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel className="text-slate-900 dark:text-slate-100 font-semibold">Data de Fim (Opcional)</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal bg-slate-50 dark:bg-slate-900/50",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP", { locale: pt })
                                                ) : (
                                                    <span>Sem data final definida</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value || undefined}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Separator className="dark:border-slate-800" />

                {/* Device Allocation Section */}
                <FormField
                    control={form.control}
                    name="deviceIds"
                    render={({ field }) => (
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel className="text-lg font-semibold text-slate-900 dark:text-slate-100">Alocação de Equipamentos</FormLabel>
                                <FormDescription>
                                    Selecione os sensores disponíveis no pool deste projeto para associar a esta experiência.
                                </FormDescription>
                            </div>
                            
                            {devices.length === 0 ? (
                                <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400 border border-dashed rounded-lg bg-slate-50 dark:bg-slate-900/30">
                                    Nenhum equipamento alocado a este projeto.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {devices.map((device) => {
                                        const isMaintenance = device.status === 'MAINTENANCE';
                                        const isRunning = device.experiments && device.experiments.length > 0;
                                        const isDisabled = isMaintenance || isRunning;
                                        const isSelected = field.value?.includes(device.id);

                                        return (
                                            <div
                                                key={device.id}
                                                onClick={() => {
                                                    if (isDisabled) return;
                                                    const newVal = isSelected 
                                                        ? field.value.filter((id) => id !== device.id)
                                                        : [...(field.value || []), device.id];
                                                    field.onChange(newVal);
                                                }}
                                                className={cn(
                                                    "relative flex flex-col p-4 border rounded-xl transition-all duration-200 select-none",
                                                    isDisabled 
                                                        ? "opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" 
                                                        : "cursor-pointer bg-white dark:bg-slate-950",
                                                    !isDisabled && isSelected 
                                                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 ring-1 ring-indigo-600" 
                                                        : !isDisabled && "hover:border-indigo-300 dark:hover:border-slate-700",
                                                )}
                                            >
                                                {/* Status Indicator */}
                                                <div className="absolute top-4 right-4">
                                                    {isSelected && !isDisabled ? (
                                                        <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                    ) : (
                                                        <div className={cn(
                                                            "h-5 w-5 rounded-full border-2",
                                                            isDisabled ? "border-slate-300 dark:border-slate-700" : "border-slate-300 dark:border-slate-600"
                                                        )} />
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className={cn(
                                                        "p-2 rounded-lg",
                                                        isDisabled ? "bg-slate-100 dark:bg-slate-800" : "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                                                    )}>
                                                        <Radio className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                                                            {device.product.name}
                                                        </h3>
                                                        <p className="text-xs text-slate-500 font-mono">
                                                            {device.serialNumber}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Conflict/Status Badges */}
                                                <div className="mt-auto pt-2 flex flex-wrap gap-2">
                                                    {isMaintenance && (
                                                        <Badge variant="destructive" className="text-[10px] flex items-center gap-1">
                                                            <AlertTriangle className="h-3 w-3" /> Manutenção
                                                        </Badge>
                                                    )}
                                                    {isRunning && (
                                                        <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 hover:bg-amber-100">
                                                            Ocupado (Em Curso)
                                                        </Badge>
                                                    )}
                                                    {!isDisabled && (
                                                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                                                            Disponível
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-4">
                    <Button 
                        type="submit" 
                        disabled={isPending}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                A criar...
                            </>
                        ) : (
                            "Criar Experiência"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
