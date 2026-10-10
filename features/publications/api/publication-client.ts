import type { PublicationStatus } from '@/server/publications/publication.entity';
import type { PublicationStatusResponse, DeletePublicationsResponse } from '@/server/publications/publication.dto';

const endpoints = {
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
