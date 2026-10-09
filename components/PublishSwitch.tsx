'use client';
export default function PublishSwitch({checked,onChange,disabled=false}:{checked:boolean;onChange:(v:boolean)=>void;disabled?:boolean}){
return <div className="publish-setting"><div><strong>공개 게시</strong><p className="search-help">{checked?'저장하면 홈페이지에 공개됩니다.':'비공개로 저장합니다. 나중에 게시할 수 있습니다.'}</p></div><button className="switch" type="button" role="switch" aria-label="공개 게시" aria-checked={checked} disabled={disabled} onClick={()=>onChange(!checked)}><span/></button></div>;
}
