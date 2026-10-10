'use client';
import ConfirmDelete from '@/components/ConfirmDelete';
import PublicationFormView from './PublicationFormView';
import PublicationListView from './PublicationListView';
import {usePublicationEditor} from '../hooks/usePublicationEditor';
import type {PublicationEditorOptions} from '../hooks/usePublicationEditor';

type Props = PublicationEditorOptions & {focused?:boolean;onTypeChange?:(type:string)=>void};
export default function PublicationEditor({focused=false,onTypeChange,...options}:Props) {
  const editor=usePublicationEditor(options),state=editor.state;
  return <div className="editor-workspace editor-workspace-single">
    {state.mode==='form'&&<PublicationFormView form={state.form} editId={state.editId} focused={focused}
      busy={state.busy} loading={state.loading} message={state.message} failed={state.failed}
      onField={editor.field} onSave={editor.save} onCancel={editor.cancel} onNew={editor.reset} onTypeChange={onTypeChange}/>}
    {state.mode==='list'&&<PublicationListView rows={state.rows} visible={editor.visible} matching={editor.matching}
      selected={state.selected} editId={state.editId} search={state.search} order={state.order}
      loading={state.loading} removing={state.removing} toggling={state.toggling}
      onSearch={editor.search} onOrder={editor.order} onSelect={editor.select} onSelectRow={editor.selectRow}
      onReload={editor.load} onNew={editor.reset} onEdit={editor.edit} onToggle={editor.toggle} onConfirm={editor.confirm}/>}
    {state.confirmId&&<ConfirmDelete
      title={state.confirmId==='bulk-publications'?state.selected.length+'개 논문을 삭제할까요?':'논문을 삭제할까요?'}
      description="논문과 Scholar 연결 정보가 삭제됩니다. 필요하면 Scholar에서 다시 가져올 수 있습니다."
      busy={state.removing} error={state.deleteError} onConfirm={editor.removeConfirmed} onCancel={editor.closeConfirmation}/>}
    {state.mode==='list'&&state.message&&<p className={state.failed?'error':'form-feedback'} role="status">{state.message}</p>}
  </div>;
}
