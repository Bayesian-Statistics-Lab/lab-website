import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {emptyPublicationForm} from '../features/publications/model/publication-editor.ts';

// Render the real display components with the existing compiler and React runtime.
// No browser, request hooks or additional testing dependencies are required.
const root=fileURLToPath(new URL('../',import.meta.url)),cache=new Map();
function component(file) {
 const filename=path.join(root,file);if(cache.has(filename))return cache.get(filename);
 const compiled=ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText;
 const exports={},nativeRequire=createRequire(filename);
 const require=specifier=>{
  const local=specifier.startsWith('@/')?path.join(root,specifier.slice(2)):specifier.startsWith('.')?path.resolve(path.dirname(filename),specifier):null;
  if(local&&fs.existsSync(local+'.tsx'))return component(path.relative(root,local+'.tsx'));
  return nativeRequire(specifier);
 };
 vm.compileFunction(compiled,['exports','require'])(exports,require);cache.set(filename,exports);return exports;
}
const Form=component('features/publications/components/PublicationFormView.tsx').default;
const List=component('features/publications/components/PublicationListView.tsx').default;
const noop=()=>{};
const paper={id:'one',title:'Bayesian <analysis>',authors:['Lee'],status:'published',citation_count:10};
const listProps={rows:[paper],visible:[paper],matching:[paper],selected:['one'],editId:'',search:'',order:'year',loading:false,removing:false,toggling:'',onSearch:noop,onOrder:noop,onSelect:noop,onSelectRow:noop,onReload:noop,onNew:noop,onEdit:noop,onToggle:noop,onConfirm:noop};

test('publication form keeps native validation, summary editor, publish switch and compact action layout',()=>{
 const html=renderToStaticMarkup(React.createElement(Form,{form:emptyPublicationForm(),editId:'',focused:true,busy:false,loading:false,message:'',failed:false,onField:noop,onSave:noop,onCancel:noop,onNew:noop}));
 assert.match(html,/editor-form-panel/);assert.match(html,/required=""/);assert.match(html,/min="1900" max="2100"/);assert.match(html,/maxLength="16000"/);assert.match(html,/논문 요약/);assert.match(html,/type="url"/);assert.match(html,/role="switch" aria-label="공개 게시" aria-checked="false"/);assert.match(html,/form-actions/);assert.match(html,/임시저장/);assert.doesNotMatch(html,/관리 항목|리치 텍스트/);
});
test('publication form keeps editing title, saving feedback and busy button guards',()=>{
 const html=renderToStaticMarkup(React.createElement(Form,{form:{...emptyPublicationForm(),title:'Existing',status:'published'},editId:'one',focused:true,busy:true,loading:false,message:'저장 중...',failed:false,onField:noop,onSave:noop,onCancel:noop,onNew:noop}));
 assert.match(html,/선택한 항목 수정/);assert.match(html,/class="primary" disabled=""/);assert.match(html,/저장 중…/);assert.match(html,/role="status" aria-live="polite"/);
});
test('publication list retains escaped titles, search, citation ordering and switch selection controls',()=>{
 const html=renderToStaticMarkup(React.createElement(List,listProps));
 assert.match(html,/Bayesian &lt;analysis&gt;/);assert.match(html,/aria-label="등록 항목 검색"/);assert.match(html,/value="citation-desc"/);assert.match(html,/value="citation-asc"/);assert.match(html,/paper-selection-bar/);assert.match(html,/paper-select/);assert.match(html,/aria-checked="true"/);assert.match(html,/cms-item-actions/);assert.match(html,/선택 삭제/);
});
test('publication list keeps loading, empty and no-match views separate',()=>{
 assert.match(renderToStaticMarkup(React.createElement(List,{...listProps,loading:true})),/목록을 불러오는 중…/);
 assert.match(renderToStaticMarkup(React.createElement(List,{...listProps,rows:[],visible:[],matching:[],selected:[]})),/등록된 항목이 없습니다/);
 assert.match(renderToStaticMarkup(React.createElement(List,{...listProps,visible:[],matching:[],search:'nothing'})),/검색 결과가 없습니다/);
});
test('publication list disables selection while deleting and the public switch while changing status',()=>{
 const html=renderToStaticMarkup(React.createElement(List,{...listProps,removing:true,toggling:'one'}));
 assert.match(html,/class="paper-select"[^>]*disabled=""/);assert.match(html,/role="switch"[^>]*disabled=""/);assert.match(html,/변경 중…/);
});
