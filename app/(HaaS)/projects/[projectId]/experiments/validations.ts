import { z } from 'zod';

export const createExperimentSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  startDate: z.date(),
  endDate: z.date().optional().nullable(),
  deviceIds: z.array(z.string()),
});

export type CreateExperimentFormValues = z.infer<typeof createExperimentSchema>;
