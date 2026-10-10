import type { PublicationStatus } from '@/server/publications/publication.entity';

type Props = {
  title: string;
  status: PublicationStatus;
  busy: boolean;
  disabled: boolean;
  onToggle: () => void;
};

// Display only: the editor owns request state, errors and list updates.
export default function PublicationStatusControl({ title, status, busy, disabled, onToggle }: Props) {
  return <>
    <button type="button" className="switch" role="switch" aria-label={title + ' 공개'}
      aria-checked={status === 'published'} disabled={disabled} onClick={onToggle}>
      <span />
    </button>
    <span className="publication-state">{busy ? '변경 중…' : status === 'published' ? '공개' : '비공개'}</span>
  </>;
}
