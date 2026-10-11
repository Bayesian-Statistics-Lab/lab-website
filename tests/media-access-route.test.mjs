import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
import {NextResponse} from 'next/server.js';
import {mediaVariant} from '../lib/media-variants.ts';
import {publicMediaPaths} from '../lib/public-media.ts';
import {storedDerivative} from '../server/media/derivative-store.ts';
const source=fs.readFileSync(new URL('../public/assets/people/kwangmin-lee.webp',import.meta.url));

const path='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.webp';
const other='cccccccc-cccc-4ccc-8ccc-cccccccccccc/dddddddd-dddd-4ddd-8ddd-dddddddddddd.webp';
const filename=new URL('../app/api/media/[...path]/route.ts',import.meta.url);
const compiled=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
function setup(){
 const state={people:[{photo_url:'/api/media/'+path}],posts:[],pages:[],account:null,memberError:false,conversion:true};
 const calls={tables:[],memberReads:0,signs:0,fetches:0,transforms:0,auth:0,streams:0};
 const caches=[],afterTasks=[];
 function cached(fn,keys,options){
  const values=new Map();caches.push({values,options});
  return async(...args)=>{const key=JSON.stringify(args);if(!values.has(key)){const value=await fn(...args);values.set(key,value)}return values.get(key)};
 }
 const visibleMemberRows=cached(async()=>{calls.memberReads++;if(state.memberError)throw Error('member lookup failed');return state.people},['visibleMemberRows'],{revalidate:60,tags:['lab-public']});
 const db={from(table){calls.tables.push(table);const query={select(){return query},eq(){return query},order(){return query},async range(){return {data:state[table]||[],error:null}}};return query}};
 const objects=new Map([[path,source],[other,source]]);
 const service={storage:{from(){return {
  download(key){return {asStream:async()=>objects.has(key)?{data:new Response(objects.get(key)).body,error:null}:{data:null,error:{statusCode:'404'}}}},
  async upload(key,bytes){calls.transforms++;objects.set(key,bytes);return {error:null}},
  async createSignedUrl(){calls.signs++;return {data:{signedUrl:'https://storage.example/original'}}}
 }}}};
 const modules={
  '@/lib/media-variants':{mediaVariant},'@/lib/public-media':{publicMediaPaths},
  '@/lib/data':{visibleMemberRows},'next/server':{NextResponse,after:task=>afterTasks.push(task)},'next/cache':{unstable_cache:cached},
  '@/lib/supabase':{publicDb:()=>db,privilegedDb:()=>service,currentAccount:async()=>{calls.auth++;return state.account}},
  '@/server/media/derivative-store':{storedDerivative},
  '@/server/media/media-transfer':{boundedBytes:async response=>new Uint8Array(await response.arrayBuffer()),streamMedia:async(_url,policy)=>{calls.streams++;return new Response('original',{headers:{'Cache-Control':policy}})}},
 };
 const exports={},nativeRequire=createRequire(filename);
 vm.compileFunction(compiled,['exports','require'])(exports,name=>modules[name]||nativeRequire(name));
 return {state,calls,invalidate(){for(const cache of caches)if(cache.options.tags?.includes('lab-public'))cache.values.clear()},
  async get(storagePath=path,query='w=320'){
   const response=await exports.GET({nextUrl:new URL('https://example.com/api/media/'+storagePath+'?'+query)},{params:Promise.resolve({path:storagePath.split('/')})});
   // Simulate the platform completing post-response work before the next request.
   for(const task of afterTasks.splice(0))await task();return response;
  }};
}
async function withFetch(action){const original=globalThis.fetch;try{await action(async()=>new Response('original'))}finally{globalThis.fetch=original}}

test('cold and warm portraits skip unrelated tables and signing; stored bytes avoid reconversion',async()=>withFetch(async fetch=>{
 const {get,calls}=setup();globalThis.fetch=async()=>{calls.fetches++;return fetch()};
 const first=await get();assert.equal(first.status,200);assert.equal(first.headers.get('Content-Type'),'image/webp');assert.ok((await first.arrayBuffer()).byteLength>0);
 assert.deepEqual(calls.tables,[]);assert.equal(calls.signs,0);assert.equal(calls.fetches,0);assert.equal(calls.transforms,1);assert.equal(calls.auth,0);
 const second=await get();assert.equal(second.status,200);assert.equal(calls.signs,0);assert.equal(calls.fetches,0);assert.equal(calls.transforms,1);assert.equal(calls.memberReads,1);
 assert.equal(second.headers.get('Cache-Control'),'public, max-age=60, s-maxage=60');
}));
test('content invalidation refreshes access without regenerating an unchanged portrait',async()=>withFetch(async fetch=>{
 const {get,calls,invalidate}=setup();globalThis.fetch=fetch;await get();invalidate();await get();
 assert.equal(calls.memberReads,2);assert.equal(calls.transforms,1);assert.equal(calls.signs,0);assert.deepEqual(calls.tables,[]);
}));
test('revoked public access cannot read a retained derivative cache',async()=>withFetch(async fetch=>{
 const {get,calls,state,invalidate}=setup();globalThis.fetch=fetch;await get();state.people=[];invalidate();
 const denied=await get();assert.equal(denied.status,404);assert.equal(await denied.text(),'');assert.equal(calls.transforms,1);assert.equal(calls.signs,0);assert.equal(calls.auth,1);
}));
test('private requests check owner access before cache lookup and never consult public member data',async()=>withFetch(async fetch=>{
 const {get,calls,state}=setup();globalThis.fetch=fetch;
 assert.equal((await get(path,'w=320&private=1')).status,404);assert.equal(calls.memberReads,0);assert.equal(calls.signs,0);
 state.account={role:'viewer',user:{id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc'}};
 assert.equal((await get(path,'w=320&private=1')).status,404);
 state.account={role:'viewer',user:{id:path.split('/')[0]}};
 const allowed=await get(path,'w=320&private=1');assert.equal(allowed.status,200);assert.equal(allowed.headers.get('Cache-Control'),'private, no-store');assert.equal(calls.memberReads,0);
}));
test('raw portraits sign once; published rich-text media still uses the general allowlist',async()=>withFetch(async fetch=>{
 const {get,calls,state}=setup();globalThis.fetch=fetch;
 const raw=await get(path,'');assert.equal(await raw.text(),'original');assert.equal(calls.signs,1);assert.equal(calls.streams,1);assert.deepEqual(calls.tables,[]);
 state.posts=[{body:'<img src="/api/media/'+other+'">'}];const embedded=await get(other);
 assert.equal(embedded.status,200);assert.deepEqual(calls.tables,['posts','pages']);assert.equal(calls.signs,1);
}));
test('lookup failures fail closed even when transformed bytes are cached',async()=>withFetch(async fetch=>{
 const {get,calls,state,invalidate}=setup();globalThis.fetch=fetch;await get();state.memberError=true;invalidate();
 await assert.rejects(get(),/member lookup failed/);assert.equal(calls.transforms,1);assert.equal(calls.signs,0);
}));
test('invalid storage paths are rejected before any cache, database or storage access',async()=>{
 const {get,calls}=setup();assert.equal((await get('../secret.jpg')).status,404);
 assert.equal(calls.memberReads,0);assert.equal(calls.signs,0);assert.equal(calls.auth,0);assert.deepEqual(calls.tables,[]);
});
