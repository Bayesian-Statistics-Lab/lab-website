'use client';
import {useState} from 'react';import AdminEditor from './AdminEditor';import ScholarManager from './ScholarManager';
export default function PublicationManager({initialId='',initialMode='manual'}:{initialId?:string;initialMode?:string}){
const [mode,setMode]=useState(initialMode),[revision,setRevision]=useState(0);
return <><div className="publication-tabs" role="tablist" aria-label="논문 추가 방식"><button id="paper-manual-tab" type="button" role="tab" aria-selected={mode==='manual'} aria-controls="paper-panel" onClick={()=>setMode('manual')}>직접 추가 / 목록 관리</button><button id="paper-scholar-tab" type="button" role="tab" aria-selected={mode==='scholar'} aria-controls="paper-panel" onClick={()=>setMode('scholar')}>Scholar에서 가져오기</button></div><div id="paper-panel" role="tabpanel" aria-labelledby={mode==='manual'?'paper-manual-tab':'paper-scholar-tab'}>{mode==='manual'?<AdminEditor key={revision+initialId} initialType="publications" initialId={initialId} focused/>:<ScholarManager onImported={()=>setRevision(r=>r+1)}/>}</div></>;
}
