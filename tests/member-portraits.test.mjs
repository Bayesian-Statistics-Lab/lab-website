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

const root=fileURLToPath(new URL('../',import.meta.url)),cache=new Map();
function component(file){
 const filename=path.join(root,file);if(cache.has(filename))return cache.get(filename);
 const compiled=ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText;
 const exports={},nativeRequire=createRequire(filename);
 const require=specifier=>{
  // The account toolbar does not change portrait rendering; avoid account hooks here.
  if(specifier==='./AdminToolbar')return {default:({children})=>children};
  const local=specifier.startsWith('@/')?path.join(root,specifier.slice(2)):specifier.startsWith('.')?path.resolve(path.dirname(filename),specifier):null;
  for(const extension of ['.tsx','.ts'])if(local&&fs.existsSync(local+extension))return component(path.relative(root,local+extension));
  return nativeRequire(specifier);
 };
 vm.compileFunction(compiled,['exports','require'])(exports,require);cache.set(filename,exports);return exports;
}
const Portrait=component('components/MemberPortrait.tsx').default;
const People=component('components/People.tsx').default;
const Profile=component('components/MemberProfile.tsx').default;
const url='/api/media/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.webp';
const render=(View,props)=>renderToStaticMarkup(React.createElement(View,props));
const images=html=>[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);

test('public list and detail portraits reuse bounded media variants without a second optimizer',()=>{
 const list=render(Portrait,{src:url,alt:'Member',width:120,height:150,sizes:'96px'});
 const detail=render(Portrait,{src:url,alt:'Member',width:280,height:350,priority:true});
 for(const html of [list,detail]){
  assert.match(html,/src="[^"]+\?w=320"/);
  assert.match(html,/srcSet="[^" ]+\?w=320 320w, [^" ]+\?w=640 640w"/);
  assert.doesNotMatch(html,/_next\/image|private=1/);
  assert.match(html,/decoding="async"/);
 }
 assert.match(list,/sizes="96px"/);assert.match(list,/loading="lazy"/);
 assert.match(detail,/sizes="280px"/);assert.match(detail,/loading="eager"/);assert.match(detail,/fetchPriority="high"/);
});
test('GIF animation, external sources and themed artwork retain their existing paths',()=>{
 const gif=render(Portrait,{src:url.replace('.webp','.gif'),alt:'GIF',width:120,height:150});
 assert.match(gif,/w=960&amp;animation=1/);assert.doesNotMatch(gif,/srcSet=/);
 const external=render(Portrait,{src:'https://example.com/photo.jpg',alt:'External',width:120,height:150});
 assert.match(external,/src="https:\/\/example.com\/photo.jpg"/);assert.doesNotMatch(external,/\?w=/);
 const artwork=render(Portrait,{src:'/assets/brand/lab-mark.svg',alt:'Lab',width:120,height:150});
 assert.match(artwork,/<svg/);assert.doesNotMatch(artwork,/<img/);
});
test('the member list starts only the first four available portraits eagerly in displayed role order',()=>{
 const people=[
  {id:'no-photo',name:'No photo',role:'Masters'},
  ...Array.from({length:6},(_,i)=>({id:String(i),name:'Member '+i,role:i%2?'Postdoc':'Masters',photo_url:url})),
  {id:'alumni',name:'Alumni',role:'Alumni',photo_url:url},
 ];
 const html=render(People,{people}),portraits=images(html);
 assert.equal(portraits.length,7);
 assert.deepEqual(portraits.map(img=>img.match(/alt="([^"]*)"/)[1]),['Member 1','Member 3','Member 5','Member 0','Member 2','Member 4','Alumni']);
 assert.deepEqual(portraits.map(img=>img.match(/loading="([^"]*)"/)[1]),['eager','eager','eager','eager','lazy','lazy','lazy']);
 assert.ok(portraits.every(img=>!img.includes('fetchPriority="high"')));
 assert.ok(portraits.every(img=>img.includes('sizes="96px"')));
});
test('the actual member detail uses the shared portrait path and keeps layout dimensions',()=>{
 const html=render(Profile,{member:{name:'Member',role:'Masters',photo_url:url}});
 const [portrait]=images(html);assert.match(portrait,/\?w=320/);assert.match(portrait,/\?w=640/);
 assert.match(portrait,/width="280" height="350"/);assert.match(portrait,/loading="eager"/);assert.match(portrait,/fetchPriority="high"/);
 assert.match(html,/member-portrait/);assert.match(html,/member-biography/);
});

test('professor interests stay in the portrait-side summary and legacy websites do not show a button',()=>{
 const Professor=component('components/People.tsx').ProfessorProfile;
 const html=render(Professor,{member:{name:'Professor',role:'Professor',photo_url:url,professor_details:{website:'https://example.com/legacy',interests:'Bayesian Inference'}}});
 assert.match(html,/class="professor-summary"[\s\S]*class="professor-interests"[\s\S]*Bayesian Inference/);
 assert.doesNotMatch(html,/개인 홈페이지|관련 링크|example.com\/legacy/);
});
test('professor related links appear only when a new link is configured',()=>{
 const Professor=component('components/People.tsx').ProfessorProfile;
 const member={name:'Professor',role:'Professor',photo_url:url};
 assert.doesNotMatch(render(Professor,{member}),/관련 링크/);
 const html=render(Professor,{member:{...member,professor_details:{related_url:'https://example.com/research'}}});
 assert.match(html,/href="https:\/\/example.com\/research" target="_blank" rel="noopener noreferrer">관련 링크/);
 const schema=component('lib/professor-details.ts').professorDetailsSchema;
 assert.equal(schema.safeParse({related_url:'javascript:alert(1)'}).success,false);
});
