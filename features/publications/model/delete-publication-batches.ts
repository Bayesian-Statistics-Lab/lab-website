import type {DeletePublicationsResponse} from '../../../server/publications/publication.dto.ts';

// Each completed request updates the screen before the next batch starts.
// A later failure leaves those successful deletions intact and rejects to the caller.
export async function deletePublicationBatches(
  ids: string[],
  remove: (ids: string[]) => Promise<DeletePublicationsResponse>,
  onDeleted: (ids: string[]) => void,
) {
  let warning='';
  for(let offset=0;offset<ids.length;offset+=100) {
    const result=await remove(ids.slice(offset,offset+100));
    onDeleted(result.deleted);
    if(result.warning)warning=result.warning;
  }
  return warning;
}
