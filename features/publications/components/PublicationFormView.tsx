import PublishSwitch from '@/components/PublishSwitch';
import type {PublicationForm} from '../model/publication-editor';

type Props = {
  form:PublicationForm;editId:string;focused:boolean;busy:boolean;loading:boolean;message:string;failed:boolean;
  onField:<K extends keyof PublicationForm>(field:K,value:PublicationForm[K])=>void;
  onSave:()=>void;onCancel:()=>void;onNew:()=>void;onTypeChange?:(type:string)=>void;
};
export default function PublicationFormView({form,editId,focused,busy,loading,message,failed,onField,onSave,onCancel,onNew,onTypeChange}:Props) {
  return <section className="admin-box editor-form-panel">
    <h2>{editId?'선택한 항목 수정':'새 항목 작성'}</h2>
    <div className="filterbar">
      {!focused&&<label>관리 항목<select value="publications" onChange={event=>onTypeChange?.(event.target.value)}>
        <option value="posts">게시글</option><option value="pages">페이지 본문</option>
        <option value="members">구성원</option><option value="publications">논문</option>
      </select></label>}
      <button className="secondary-button" onClick={onNew}>새로 작성</button>
    </div>
    <form onSubmit={event=>{event.preventDefault();onSave()}}>
      <label>제목<input className="field" value={form.title} onChange={event=>onField('title',event.target.value)} required/></label>
      <p className="search-help">제목만 입력해도 저장할 수 있습니다. 저자와 학술지 정보는 나중에 보완할 수 있습니다.</p>
      <label>저자<textarea className="field" rows={2} placeholder="한 줄에 한 명씩 입력" value={form.authors} onChange={event=>onField('authors',event.target.value)}/></label>
      <div className="form-grid">
        <label>발행연도<input className="field" type="number" min={1900} max={2100} placeholder="예: 2026" value={form.year} onChange={event=>onField('year',event.target.value)}/></label>
        <label>학술지 / 학회<input className="field" placeholder="학술지 이름" value={form.venue} onChange={event=>onField('venue',event.target.value)}/></label>
      </div>
      <label>논문 요약<textarea className="field" rows={5} maxLength={16000} value={form.summary||''} onChange={event=>onField('summary',event.target.value)}/></label>
      <details className="editor-advanced"><summary>원문 링크와 DOI 추가 (선택)</summary>
        <label>논문 URL<input className="field" type="url" placeholder="https://…" value={form.paper_url} onChange={event=>onField('paper_url',event.target.value)}/></label>
        <label>DOI<input className="field" value={form.doi} onChange={event=>onField('doi',event.target.value)}/></label>
      </details>
      <PublishSwitch checked={form.status==='published'} onChange={value=>onField('status',value?'published':'draft')} disabled={busy}/>
      <div className="form-actions">
        <button className="primary" disabled={busy||loading}>{busy?'저장 중…':editId?'수정 저장':form.status==='published'?'게시하기':'임시저장'}</button>
        <button type="button" className="secondary-button" disabled={busy} onClick={onCancel}>취소</button>
        <p className={'form-feedback '+(failed?'error':'')} role="status" aria-live="polite">{message}</p>
      </div>
    </form>
  </section>;
}
