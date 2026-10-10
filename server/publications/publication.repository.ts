import type { SupabaseClient } from '@supabase/supabase-js';
import { publicationSummarySlug } from './publication.entity.ts';
import type { PublicationIdentity, PublicationState, PublicationStatus } from './publication.entity.ts';

type MutationResult<T> = { data: T | null; error: unknown };
export interface PublicationRepository {
  changeStatus(id: string, status: PublicationStatus): Promise<MutationResult<PublicationState>>;
  changeSummaryStatus(id: string, status: PublicationStatus): Promise<{ error: unknown }>;
  deleteByIds(ids: string[]): Promise<MutationResult<PublicationIdentity[]>>;
  deleteSummaries(ids: string[]): Promise<{ error: unknown }>;
}

// Use the caller's authenticated client: retain the existing RLS checks.
export function createPublicationRepository(db: SupabaseClient): PublicationRepository {
  return {
    async changeStatus(id, status) {
      return db.from('publications').update({ status }).eq('id', id).select('id,status').maybeSingle();
    },
    async changeSummaryStatus(id, status) {
      return db.from('pages').update({ status }).eq('slug', publicationSummarySlug(id));
    },
    async deleteByIds(ids) {
      return db.from('publications').delete().in('id', ids).select('id');
    },
    async deleteSummaries(ids) {
      return db.from('pages').delete().in('slug', ids.map(publicationSummarySlug));
    },
  };
}
