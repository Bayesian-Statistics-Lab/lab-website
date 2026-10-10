import type { PublicationStatus } from '../../../server/publications/publication.entity.ts';
import {sortPapers} from '../../../lib/papers.ts';

export type PublicationRow = {
  id: string;
  title: string;
  status: PublicationStatus;
  authors?: string[] | null;
  year?: number | null;
  venue?: string | null;
  doi?: string | null;
  paper_url?: string | null;
  citation_count?: number | null;
  summary?: string;
};
export type PublicationForm = {
  title: string;
  authors: string;
  year: string;
  venue: string;
  doi: string;
  paper_url: string;
  summary?: string;
  status: PublicationStatus;
};
export type PublicationSaveRequest = {
  type: 'publications';
  id?: string;
  title: string;
  authors: string[];
  year: number | null;
  venue: string;
  doi: string;
  paper_url: string;
  summary?: string;
  status: PublicationStatus;
};
export function emptyPublicationForm(): PublicationForm {
  return {title:'',authors:'',year:'',venue:'',doi:'',paper_url:'',status:'draft'};
}
export function publicationForm(row: PublicationRow): PublicationForm {
  return {
    title:row.title,authors:(row.authors||[]).join('\n'),year:row.year?String(row.year):'',
    venue:row.venue||'',doi:row.doi||'',paper_url:row.paper_url||'',summary:row.summary,status:row.status,
  };
}
export function publicationPayload(form: PublicationForm, id: string): PublicationSaveRequest {
  return {
    ...form,type:'publications',id:id||undefined,
    authors:form.authors.split('\n').map(author=>author.trim()).filter(Boolean),
    year:form.year?Number(form.year):null,
  };
}
export function matchingPublications(rows: PublicationRow[], search: string) {
  return rows.filter(row=>[row.title,...(row.authors||[])].join(' ').toLowerCase().includes(search.toLowerCase()));
}
export function visiblePublications(rows: PublicationRow[], search: string, order: string) {
  return matchingPublications(sortPapers(rows,order),search);
}
export function applyPublicationDeletion(rows: PublicationRow[], selected: string[], editId: string, deleted: string[]) {
  return {
    rows:rows.filter(row=>!deleted.includes(row.id)),
    selected:selected.filter(id=>!deleted.includes(id)),
    editId:deleted.includes(editId)?'':editId,
  };
}
