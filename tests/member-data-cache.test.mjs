import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function setup(){
 const queries=[],policies=[],state={error:null};
 const db={from(table){
  const call={table,filters:[]};queries.push(call);
  const query={select(columns){call.columns=columns;return query},eq(key,value){call.filters.push([key,value]);return query},order(){return query},or(){return query},
   then(resolve,reject){const result=table==='members'?{data:[{id:'one',name:'Member',photo_url:'/api/media/photo.webp'}],error:state.error}:{data:[{slug:'settings/member/one',body:'{"department":"Statistics"}'}],error:null};return Promise.resolve(result).then(resolve,reject)}};
  return query;
 }};
 const cached=(fn,keys,options)=>{
  policies.push({keys,options});const values=new Map();
  return async(...args)=>{const key=JSON.stringify(args);if(!values.has(key))values.set(key,await fn(...args));return values.get(key)};
 };
 const source=fs.readFileSync(new URL('../lib/data.ts',import.meta.url),'utf8');
 const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const exports={};vm.compileFunction(compiled,['exports','require'])(exports,name=>{
  if(name==='next/cache')return {unstable_cache:cached};if(name==='./supabase')return {publicDb:()=>db};
  if(name==='./board-pagination'||name==='./post-metadata')return {};
  throw Error('Unexpected dependency '+name);
 });
 return {data:exports,queries,policies,state};
}
test('member views and media access reuse the same visible rows query and preserve profile details',async()=>{
 const {data,queries,policies}=setup();
 const people=await data.members();const visible=await data.visibleMemberRows();
 assert.equal(people[0].photo_url,visible[0].photo_url);assert.equal(people[0].details.department,'Statistics');
 assert.equal(queries.filter(q=>q.table==='members').length,1);
 assert.deepEqual(queries.find(q=>q.table==='members').filters,[['is_visible',true]]);
 assert.deepEqual(queries.find(q=>q.table==='pages').filters,[['status','published']]);
 const shared=policies.find(p=>p.keys[0]==='visibleMemberRows');assert.equal(shared.options.revalidate,60);assert.deepEqual(shared.options.tags,['lab-public']);
});
test('failed public member queries cannot become a cached authorization result',async()=>{
 const {data,queries,state}=setup();state.error={message:'Database unavailable'};
 await assert.rejects(data.visibleMemberRows(),/공개 구성원/);state.error=null;
 assert.equal((await data.visibleMemberRows()).length,1);assert.equal(queries.length,2);
});
