import { z } from 'zod';
import type { PublicationState } from './publication.entity.ts';

export const changePublicationStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['draft', 'published']),
});
export const deletePublicationsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
});

export type ChangePublicationStatusRequest = z.infer<typeof changePublicationStatusSchema>;
export type DeletePublicationsRequest = z.infer<typeof deletePublicationsSchema>;
export type PublicationStatusResponse = { data: PublicationState };
export type DeletePublicationsResponse = { deleted: string[]; warning: string };
