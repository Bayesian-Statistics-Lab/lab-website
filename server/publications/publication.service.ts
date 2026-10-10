import type { ChangePublicationStatusRequest, DeletePublicationsRequest } from './publication.dto.ts';
import type { PublicationState } from './publication.entity.ts';
import type { PublicationRepository } from './publication.repository.ts';

type StatusResult = { kind: 'failed' } | {
  kind: 'changed'; publication: PublicationState; summaryUpdated: boolean;
};
type DeletionResult = { kind: 'failed' } | { kind: 'none' } | {
  kind: 'deleted'; deleted: string[]; summaryCleaned: boolean; partial: boolean;
};

export function createPublicationService(repository: PublicationRepository) {
  return {
    async changeStatus(request: ChangePublicationStatusRequest): Promise<StatusResult> {
      const result = await repository.changeStatus(request.id, request.status);
      if (result.error || !result.data) return { kind: 'failed' };
      const summary = await repository.changeSummaryStatus(request.id, request.status);
      return { kind: 'changed', publication: result.data, summaryUpdated: !summary.error };
    },
    async deleteSelected(request: DeletePublicationsRequest): Promise<DeletionResult> {
      const ids = [...new Set(request.ids)];
      const result = await repository.deleteByIds(ids);
      if (result.error) return { kind: 'failed' };
      const deleted = (result.data || []).map(publication => publication.id);
      if (!deleted.length) return { kind: 'none' };
      // Clean up only rows actually deleted, including when RLS affects fewer rows.
      const summary = await repository.deleteSummaries(deleted);
      return { kind: 'deleted', deleted, summaryCleaned: !summary.error, partial: deleted.length !== ids.length };
    },
  };
}
