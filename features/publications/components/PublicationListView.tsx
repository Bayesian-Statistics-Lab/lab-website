import PublicationStatusControl from './PublicationStatusControl';
import type {PublicationRow} from '../model/publication-editor';

type Props = {
  rows:PublicationRow[];visible:PublicationRow[];matching:PublicationRow[];selected:string[];
  editId:string;search:string;order:string;loading:boolean;removing:boolean;toggling:string;
  onSearch:(value:string)=>void;onOrder:(value:string)=>void;onSelect:(ids:string[])=>void;onSelectRow:(id:string,checked:boolean)=>void;
  onReload:()=>void;onNew:()=>void;onEdit:(row:PublicationRow)=>void;
  onToggle:(row:PublicationRow)=>void;onConfirm:(id:string)=>void;
};
export default function PublicationListView({rows,visible,matching,selected,editId,search,order,loading,removing,toggling,onSearch,onOrder,onSelect,onSelectRow,onReload,onNew,onEdit,onToggle,onConfirm}:Props) {
  return <section className="admin-box editor-list-panel">
    <div className="list-panel-heading"><h2>논문 목록</h2><div className="list-panel-actions">
      <button className="secondary-button" onClick={onReload} disabled={loading}>새로고침</button>
      <button className="primary" onClick={onNew}>새로 작성</button>
    </div></div>
    <input className="field" value={search} onChange={event=>onSearch(event.target.value)} placeholder="논문 제목 또는 저자 검색" aria-label="등록 항목 검색"/>
    <div className="paper-selection-bar">
      <label className="check-label"><input type="checkbox" disabled={removing} checked={matching.length>0&&matching.every(row=>selected.includes(row.id))} onChange={event=>onSelect(event.target.checked?matching.map(row=>row.id):[])}/> 목록 전체 선택</label>
      <span>{selected.length}개 선택</span>
      <button type="button" className="danger-button" disabled={!selected.length||removing} onClick={()=>onConfirm('bulk-publications')}>선택 삭제</button>
    </div>
    <label>정렬<select className="field" value={order} onChange={event=>onOrder(event.target.value)}>
      <option value="year">최근 발행순</option><option value="citation-desc">인용수 높은 순</option><option value="citation-asc">인용수 낮은 순</option>
    </select></label>
    <p className="search-help">선택한 논문을 삭제하면 Scholar 연결도 제거되어 다시 가져올 수 있습니다.</p>
    {visible.map(row=><div className={'cms-row '+(row.id===editId?'selected':'')} key={row.id}>
      <input className="paper-select" type="checkbox" disabled={removing} aria-label={(row.title||'논문')+' 선택'} checked={selected.includes(row.id)} onChange={event=>onSelectRow(row.id,event.target.checked)}/>
      <div className="cms-item-copy"><strong>{row.title}</strong><p className="search-help">{row.status==='published'?'공개':'비공개'} · 인용 {row.citation_count??'—'}회</p></div>
      <div className="cms-item-actions">
        <PublicationStatusControl title={row.title||'논문'} status={row.status} disabled={!!toggling} busy={toggling===row.id} onToggle={()=>onToggle(row)}/>
        {' '}<button className="secondary-button" onClick={()=>onEdit(row)}>수정</button>{' '}
        <button className="danger-button" onClick={()=>onConfirm(row.id)}>삭제</button>
      </div>
    </div>)}
    {loading?<p className="muted" role="status">목록을 불러오는 중…</p>:!rows.length?<div className="empty">등록된 항목이 없습니다. 새 항목을 작성하세요.</div>:!visible.length&&<div className="empty">검색 결과가 없습니다.</div>}
  </section>;
}
