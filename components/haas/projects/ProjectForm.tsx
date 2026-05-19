"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { useProjectStore } from "@/hooks/useProjectStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ProjectFormValues {
  name: string;
  description?: string;
  startDate?: string;
  expectedEndDate?: string;
}

export function ProjectForm({ className }: React.ComponentProps<"form">) {
  const { setIsOpen } = useProjectStore();
  
  const form = useForm<ProjectFormValues>({
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      expectedEndDate: "",
    },
  });

  const onSubmit = (data: ProjectFormValues) => {
    console.log("Formulário submetido:", data);
    // TODO: Connect to Server Action here in the next step
    setIsOpen(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`grid items-start gap-4 ${className || ''}`}>
        
        <FormField
          control={form.control}
          name="name"
          rules={{ 
            required: "O nome do projeto é obrigatório.",
            minLength: { value: 2, message: "O nome deve ter pelo menos 2 caracteres." }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Projeto *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Fotobiorreator Alpha" {...field} />
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
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Descreva o objetivo deste projeto..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Início</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expectedEndDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Fim (Prevista)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full mt-2" 
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "A criar..." : "Criar Projeto"}
        </Button>
      </form>
    </Form>
  );
}
