"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useProjectStore } from "@/hooks/useProjectStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Users,
  Cpu,
  Settings,
  ListTodo,
  AlertTriangle,
  Loader2
} from "lucide-react";
import {
  getDepartmentMembersAction,
  getAvailableDevicesAction,
  createProjectAction,
  DepartmentMember,
  AvailableDevice
} from "@/actions/projects";
import { ProjectRole } from "@prisma/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface DeviceSetting {
  phMin?: string;
  phMax?: string;
  tempMin?: string;
  tempMax?: string;
}

interface ProjectWizardValues {
  name: string;
  description: string;
  members: {
    userId: string;
    role: ProjectRole;
  }[];
  deviceIds: string[];
  settings: {
    devices: Record<string, DeviceSetting>;
  };
}

export function ProjectWizard() {
  const { currentStep, nextStep, prevStep, setIsOpen, resetWizard } = useProjectStore();
  const [allMembers, setAllMembers] = useState<DepartmentMember[]>([]);
  const [allDevices, setAllDevices] = useState<AvailableDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [deviceSearch, setDeviceSearch] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const form = useForm<ProjectWizardValues>({
    defaultValues: {
      name: "",
      description: "",
      members: [],
      deviceIds: [],
      settings: {
        devices: {},
      },
    },
    mode: "onChange",
  });

  const { fields: memberFields, append: appendMember, remove: removeMember } = useFieldArray({
    control: form.control,
    name: "members",
  });

  // Load members and devices on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [membersRes, devicesRes] = await Promise.all([
          getDepartmentMembersAction(),
          getAvailableDevicesAction()
        ]);

        if (membersRes.success && membersRes.members) {
          setAllMembers(membersRes.members);
        } else if (membersRes.error) {
          toast.error(membersRes.error);
        }

        if (devicesRes.success && devicesRes.devices) {
          setAllDevices(devicesRes.devices);
        } else if (devicesRes.error) {
          toast.error(devicesRes.error);
        }
      } catch (error) {
        toast.error("Erro ao carregar os dados.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const deviceIds = form.watch("deviceIds") || [];
  const selectedDevices = allDevices.filter((d) => deviceIds.includes(d.id));

  // Step names
  const steps = [
    { label: "Geral", icon: ListTodo },
    { label: "Equipa", icon: Users },
    { label: "Equipamento", icon: Cpu },
    { label: "Configuração", icon: Settings },
    { label: "Revisão", icon: Check },
  ];

  // Handle validating step fields before going forward
  const handleNext = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isValidating) return;

    setIsValidating(true);

    let fieldsToValidate: any[] = [];
    if (currentStep === 0) {
      fieldsToValidate = ["name", "description"];
    } else if (currentStep === 1) {
      fieldsToValidate = ["members"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["deviceIds"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["settings"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      nextStep();
    }

    setIsValidating(false);
  };

  const onSubmit = async (data: ProjectWizardValues) => {
    try {
      setSubmitting(true);

      // Clean settings dynamically: only save configuration for currently selected devices
      const activeSettings: Record<string, any> = {};
      data.deviceIds.forEach((id) => {
        const devSettings = data.settings?.devices?.[id];
        if (devSettings) {
          activeSettings[id] = {
            phMin: devSettings.phMin ? parseFloat(devSettings.phMin) : null,
            phMax: devSettings.phMax ? parseFloat(devSettings.phMax) : null,
            tempMin: devSettings.tempMin ? parseFloat(devSettings.tempMin) : null,
            tempMax: devSettings.tempMax ? parseFloat(devSettings.tempMax) : null,
          };
        }
      });

      const res = await createProjectAction({
        name: data.name,
        description: data.description,
        members: data.members,
        deviceIds: data.deviceIds,
        settings: { devices: activeSettings },
      });

      if (res.success) {
        toast.success("Projeto criado com sucesso!");
        setIsOpen(false);
        resetWizard();
      } else {
        toast.error(res.error || "Ocorreu um erro ao criar o projeto.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Ocorreu um erro.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter members by search input (memoized to prevent recalculation on unrelated form edits)
  const filteredMembers = React.useMemo(() => {
    const search = memberSearch.toLowerCase();
    if (!search) return allMembers;
    return allMembers.filter((m) => {
      return (
        (m.name?.toLowerCase().includes(search) || false) ||
        m.email.toLowerCase().includes(search)
      );
    });
  }, [allMembers, memberSearch]);

  // Filter devices by search input (memoized to prevent recalculation on unrelated form edits)
  const filteredDevices = React.useMemo(() => {
    const search = deviceSearch.toLowerCase();
    if (!search) return allDevices;
    return allDevices.filter((d) => {
      return (
        d.serialNumber.toLowerCase().includes(search) ||
        d.product.name.toLowerCase().includes(search)
      );
    });
  }, [allDevices, deviceSearch]);

  if (loading) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">A obter informações do departamento...</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-6">
      {/* Premium Stepper Progress Header */}
      <div className="space-y-3">
        {/* Step Circles (hidden on extra small screens for cleaner mobile layout) */}
        <div className="hidden sm:flex justify-between items-center pt-2">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 relative">
                {idx > 0 && (
                  <div
                    className={`absolute left-[-50%] top-4 h-[2px] w-full -z-10 ${idx <= currentStep ? "bg-primary" : "bg-muted"
                      }`}
                  />
                )}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_8px_rgba(var(--primary),0.5)] scale-110"
                    : isCompleted
                      ? "bg-primary/20 text-primary border-primary"
                      : "bg-muted text-muted-foreground border-muted"
                    }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors ${isActive ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ScrollArea className="max-h-[50vh] sm:max-h-[55vh] overflow-y-auto px-1">
            <div className="space-y-4 py-2">
              {/* STEP 1: GENERAL INFO */}
              {currentStep === 0 && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{
                      required: "O nome do projeto é obrigatório.",
                      minLength: { value: 3, message: "O nome do projeto deve ter no mínimo 3 caracteres." }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Nome do Projeto *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Monitorização Estufa Norte" {...field} className="rounded-lg shadow-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o propósito e os objetivos deste projeto..."
                            className="min-h-[100px] resize-none rounded-lg shadow-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* STEP 2: TEAM SELECT */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <div className="space-y-2">
                    <FormLabel className="text-sm font-semibold">Adicionar Membros à Equipa</FormLabel>
                    <p className="text-xs text-muted-foreground">Pesquise e selecione colaboradores da sua organização para fazerem parte deste projeto.</p>
                    <Input
                      placeholder="Pesquisar por nome ou email..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="rounded-lg shadow-sm"
                    />
                  </div>

                  <div className="border rounded-xl divide-y overflow-hidden max-h-[300px] overflow-y-auto shadow-sm">
                    {filteredMembers.length === 0 ? (
                      <p className="text-sm text-center text-muted-foreground py-6">Nenhum membro encontrado.</p>
                    ) : (
                      filteredMembers.map((member) => {
                        const isSelected = memberFields.some((f) => f.userId === member.id);
                        const memberIndex = memberFields.findIndex((f) => f.userId === member.id);

                        return (
                          <div
                            key={member.id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-2 transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-muted/50"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    appendMember({ userId: member.id, role: "VIEWER" as ProjectRole });
                                  } else {
                                    removeMember(memberIndex);
                                  }
                                }}
                              />
                              <Avatar className="h-8 w-8">
                                {member.image && <AvatarImage src={member.image} alt={member.name || member.email} />}
                                <AvatarFallback className="bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                  {getInitials(member.name || member.email)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{member.name || member.email}</span>
                                <span className="text-xs text-muted-foreground">{member.email}</span>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="flex items-center gap-2 pl-7 sm:pl-0">
                                <span className="text-xs text-muted-foreground font-medium">Permissão:</span>
                                <Select
                                  value={memberFields[memberIndex]?.role}
                                  onValueChange={(val) => {
                                    form.setValue(`members.${memberIndex}.role`, val as ProjectRole);
                                  }}
                                >
                                  <SelectTrigger className="w-[120px] h-8 text-xs rounded-lg shadow-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="VIEWER">Visualizador</SelectItem>
                                    <SelectItem value="EDITOR">Editor</SelectItem>
                                    <SelectItem value="OWNER">Gestor (Dono)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: EQUIPMENT SELECT */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <div className="space-y-2">
                    <FormLabel className="text-sm font-semibold">Alocar Equipamento</FormLabel>
                    <p className="text-xs text-muted-foreground">Escolha os equipamentos atualmente livres no departamento para o pool de hardware deste projeto.</p>
                    <Input
                      placeholder="Pesquisar por modelo ou nº de série..."
                      value={deviceSearch}
                      onChange={(e) => setDeviceSearch(e.target.value)}
                      className="rounded-lg shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto p-0.5">
                    {filteredDevices.length === 0 ? (
                      <div className="col-span-full border border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-center text-muted-foreground gap-1">
                        <AlertTriangle className="h-6 w-6 text-amber-500" />
                        <p className="text-sm font-medium">Nenhum equipamento disponível encontrado.</p>
                        <p className="text-xs">Certifique-se de que os seus equipamentos não estão associados a outros projetos.</p>
                      </div>
                    ) : (
                      filteredDevices.map((device) => {
                        const isSelected = deviceIds.includes(device.id);
                        return (
                          <div
                            key={device.id}
                            onClick={() => {
                              if (isSelected) {
                                form.setValue(
                                  "deviceIds",
                                  deviceIds.filter((id) => id !== device.id)
                                );
                              } else {
                                form.setValue("deviceIds", [...deviceIds, device.id]);
                              }
                            }}
                            className={`border rounded-xl p-3.5 cursor-pointer transition-all flex flex-col gap-2 relative ${isSelected
                              ? "border-primary bg-primary/5 shadow-md"
                              : "hover:border-muted-foreground/30 hover:bg-muted/30"
                              }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                  {device.product.type}
                                </span>
                                <span className="text-sm font-bold">{device.product.name}</span>
                              </div>
                              <div
                                className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
                                  }`}
                              >
                                {isSelected && <Check className="h-3 w-3" />}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs mt-1">
                              <span className="text-muted-foreground font-mono">S/N: {device.serialNumber}</span>
                              <Badge variant={device.status === "ACTIVE" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0.5">
                                {device.status}
                              </Badge>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: HARDWARE THRESHOLD CONFIG */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <div>
                    <FormLabel className="text-sm font-semibold">Configuração de Limites & Alertas</FormLabel>
                    <p className="text-xs text-muted-foreground">Defina os valores ideais de operação para cada equipamento selecionado. Serão gerados alertas caso sejam violados.</p>
                  </div>

                  {selectedDevices.length === 0 ? (
                    <div className="border border-dashed rounded-xl p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                      <Cpu className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm font-medium">Nenhum equipamento selecionado no passo anterior.</p>
                      <Button type="button" variant="link" size="sm" onClick={() => form.setValue("deviceIds", [])}>
                        Voltar para selecionar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedDevices.map((device) => {
                        const isSensor = device.product.type.includes("SENSOR");
                        return (
                          <div key={device.id} className="border rounded-xl p-4 space-y-4 shadow-sm bg-card transition-all">
                            <div className="flex items-center justify-between border-b pb-2">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-card-foreground">{device.product.name}</span>
                                <span className="text-xs text-muted-foreground font-mono">S/N: {device.serialNumber}</span>
                              </div>
                              <Badge variant="outline" className="text-[10px] font-semibold bg-muted uppercase">
                                {device.product.type}
                              </Badge>
                            </div>

                            {/* Dynamically display pH / Temperature thresholds if device is a Sensor */}
                            {isSensor ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Alertas de pH
                                  </span>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">Mínimo</label>
                                      <Input
                                        type="number"
                                        step="0.1"
                                        placeholder="Min (ex: 6.5)"
                                        className="h-8 text-xs rounded-lg shadow-sm"
                                        {...form.register(`settings.devices.${device.id}.phMin`)}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">Máximo</label>
                                      <Input
                                        type="number"
                                        step="0.1"
                                        placeholder="Max (ex: 8.5)"
                                        className="h-8 text-xs rounded-lg shadow-sm"
                                        {...form.register(`settings.devices.${device.id}.phMax`)}
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Alertas de Temp. (°C)
                                  </span>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">Mínima</label>
                                      <Input
                                        type="number"
                                        step="0.5"
                                        placeholder="Min (ex: 18.0)"
                                        className="h-8 text-xs rounded-lg shadow-sm"
                                        {...form.register(`settings.devices.${device.id}.tempMin`)}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">Máxima</label>
                                      <Input
                                        type="number"
                                        step="0.5"
                                        placeholder="Max (ex: 28.0)"
                                        className="h-8 text-xs rounded-lg shadow-sm"
                                        {...form.register(`settings.devices.${device.id}.tempMax`)}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                                <Settings className="h-4 w-4 text-muted-foreground" />
                                <span>Este dispositivo (Gateway/Base) não possui limites de medição de sensores diretos.</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: REVIEW */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div>
                    <FormLabel className="text-sm font-semibold">Resumo do Novo Projeto</FormLabel>
                    <p className="text-xs text-muted-foreground">Por favor, reveja todas as configurações antes de oficializar a criação do projeto.</p>
                  </div>

                  <div className="space-y-4">
                    {/* General details */}
                    <div className="border rounded-xl p-4 space-y-2 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-semibold uppercase">Dados Gerais</span>
                        <Badge variant="outline" className="text-[10px]">Pág. 1</Badge>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-foreground">{form.watch("name")}</h4>
                        <p className="text-xs text-muted-foreground whitespace-pre-line">
                          {form.watch("description") || "Sem descrição fornecida."}
                        </p>
                      </div>
                    </div>

                    {/* Team Details */}
                    <div className="border rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-semibold uppercase">Equipa Associada ({memberFields.length})</span>
                        <Badge variant="outline" className="text-[10px]">Pág. 2</Badge>
                      </div>
                      {memberFields.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">Apenas você será o Gestor (Dono) por padrão.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {memberFields.map((f, index) => {
                            const member = allMembers.find((m) => m.id === f.userId);
                            return (
                              <div key={f.id} className="flex items-center justify-between border rounded-lg p-2.5 bg-background text-xs">
                                <div className="flex flex-col gap-0.5 max-w-[70%]">
                                  <span className="font-semibold truncate">{member?.name || member?.email}</span>
                                  <span className="text-[10px] text-muted-foreground truncate">{member?.email}</span>
                                </div>
                                <Badge variant="secondary" className="text-[9px] uppercase font-bold px-1.5 py-0.5">
                                  {f.role === "OWNER" ? "Gestor" : f.role === "EDITOR" ? "Editor" : "Visualizador"}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Equipment Details */}
                    <div className="border rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-semibold uppercase">Equipamento Alocado ({deviceIds.length})</span>
                        <Badge variant="outline" className="text-[10px]">Pág. 3 & 4</Badge>
                      </div>
                      {deviceIds.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">Nenhum equipamento alocado inicialmente.</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedDevices.map((device) => {
                            const devSettings = form.watch(`settings.devices.${device.id}`) as DeviceSetting | undefined;
                            const hasPHAlert = devSettings?.phMin || devSettings?.phMax;
                            const hasTempAlert = devSettings?.tempMin || devSettings?.tempMax;

                            return (
                              <div key={device.id} className="border rounded-lg p-3 bg-background text-xs space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="font-bold">{device.product.name}</span>
                                    <span className="text-[10px] text-muted-foreground font-mono">S/N: {device.serialNumber}</span>
                                  </div>
                                  <Badge variant="outline" className="text-[9px] bg-muted py-0.5">
                                    {device.product.type}
                                  </Badge>
                                </div>

                                {/* Custom threshold displays if configured */}
                                {(hasPHAlert || hasTempAlert) ? (
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {hasPHAlert && (
                                      <Badge variant="secondary" className="text-[9px] gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20">
                                        pH: {devSettings?.phMin || "N/A"} - {devSettings?.phMax || "N/A"}
                                      </Badge>
                                    )}
                                    {hasTempAlert && (
                                      <Badge variant="secondary" className="text-[9px] gap-1 bg-sky-500/10 text-sky-600 border-sky-500/20">
                                        Temp: {devSettings?.tempMin || "N/A"}°C - {devSettings?.tempMax || "N/A"}°C
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground italic block">Sem alertas personalizados ativos.</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Dialog / Drawer Footer Buttons */}
          <div className="flex items-center justify-between border-t pt-4 bg-background">
            <Button
              type="button"
              variant="outline"
              disabled={currentStep === 0 || submitting}
              onClick={prevStep}
              className="gap-1 px-4 h-9 rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                key="continue-btn"
                type="button"
                onClick={handleNext}
                disabled={isValidating || submitting}
                className="gap-1 px-4 h-9 rounded-lg"
              >
                <span>{isValidating ? "A verificar..." : "Continuar"}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                key="submit-btn"
                type="submit"
                disabled={submitting}
                className="gap-1.5 px-5 h-9 rounded-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>A criar...</span>
                  </>
                ) : (
                  <>
                    <span>Criar Projeto</span>
                    <Check className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
