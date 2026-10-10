export type PublicationStatus = 'draft' | 'published';

// The moderation use case only needs identity and publication state.
export type PublicationState = { id: string; status: PublicationStatus };
export type PublicationIdentity = Pick<PublicationState, 'id'>;

export function publicationSummarySlug(id: string) {
  return `settings/paper/${id}`;
}
