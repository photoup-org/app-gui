import { z } from 'zod';

export const createExperimentSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  startDate: z.date(),
  endDate: z.date().optional().nullable(),
  deviceIds: z.array(z.string()).min(1, { message: "Selecione pelo menos um equipamento para iniciar a experiência." }),
  settings: z.object({
    storageFrequency: z.coerce.number().min(1),
    aggregationStrategy: z.enum(['AVERAGE', 'MAX', 'MIN', 'LAST_VALUE']),
    exportDelimiter: z.enum([':', ';']),
    devices: z.record(z.string(), z.any()).optional(),
  }).optional(),
});

export type CreateExperimentFormValues = z.infer<typeof createExperimentSchema>;
