import type { PublicationStatus } from '@/server/publications/publication.entity';
import type { PublicationStatusResponse, DeletePublicationsResponse } from '@/server/publications/publication.dto';

import type {PublicationRow,PublicationSaveRequest} from '../model/publication-editor.ts';

const endpoints = {
  content: '/api/v1/admin/content',
  status: '/api/v1/admin/publications/status',
  delete: '/api/v1/admin/publications/delete',
};

async function request<T>(url: string, method: string, payload: unknown, transport: typeof fetch): Promise<T> {
  const response = await transport(url, {
    method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload),
  });
  const body = await response.json();
  if (!response.ok) throw Error(body.error);
  return body as T;
}

export function changePublicationStatus(id: string, status: PublicationStatus, transport = fetch) {
  return request<PublicationStatusResponse>(endpoints.status, 'PATCH', { id, status }, transport);
}

// The editor keeps batching and immediate UI updates; transport only handles one request.
export function deletePublications(ids: string[], transport = fetch) {
  return request<DeletePublicationsResponse>(endpoints.delete, 'DELETE', { ids }, transport);
}

export async function loadPublications(filter: {id?:string;slug?:string} = {}, transport = fetch) {
  const suffix=filter.slug?'&slug='+encodeURIComponent(filter.slug):filter.id?'&id='+filter.id:'';
  const response=await transport(endpoints.content+'?type=publications'+suffix);
  const body=await response.json();
  if(!response.ok)throw Error(body.error);
  return (body.data||[]) as PublicationRow[];
}
export function savePublication(payload: PublicationSaveRequest, transport = fetch) {
  return request<{data:PublicationRow}>(endpoints.content,payload.id?'PATCH':'POST',payload,transport);
}
