import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {storedDerivative,derivativeObjectPath} from '../server/media/derivative-store.ts';
import {maxDerivativeBytes} from '../server/media/image-transform.ts';
const original='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.webp';
const variant={width:320,animated:false};
const source=fs.readFileSync(new URL('../public/assets/people/kwangmin-lee.webp',import.meta.url));
function bucket(){
 const objects=new Map([[original,source]]),reads=[],writes=[];
 const state={uploadError:false,downloadError:null};
 return {objects,reads,writes,state,
  download(key,_options,parameters){reads.push({key,parameters});return {asStream:async()=>state.downloadError?{data:null,error:state.downloadError}:objects.has(key)?{data:new Response(objects.get(key)).body,error:null}:{data:null,error:{statusCode:'404'}}}},
  async upload(key,body,options){writes.push({key,options});if(state.uploadError)throw Error('Storage write unavailable');objects.set(key,body);return {error:null}},
 };
}
test('binary derivatives persist and are reused across independent calls without re-reading originals',async()=>{
 const storage=bucket(),first=await storedDerivative(storage,original,variant),second=await storedDerivative(storage,original,variant);
 assert.ok(first);assert.deepEqual(first.bytes,second.bytes);assert.equal(first.type,'image/webp');
 assert.equal(storage.reads.filter(read=>read.key===original).length,1);assert.equal(storage.writes.length,1);
 assert.equal(storage.writes[0].options.upsert,false);assert.equal(storage.writes[0].options.contentType,'image/webp');
 assert.ok(storage.reads.every(read=>read.parameters.cache==='no-store'&&read.parameters.signal instanceof AbortSignal));
});
test('internal derivative keys isolate size, animation, file format and owner without changing original paths',()=>{
 const key=derivativeObjectPath(original,variant);assert.ok(key.startsWith(original.split('/')[0]+'/derived/'));
 assert.notEqual(key,derivativeObjectPath(original,{width:640,animated:false}));
 assert.notEqual(key,derivativeObjectPath(original,{width:320,animated:true}));
 assert.notEqual(key,derivativeObjectPath(original.replace('.webp','.gif'),variant));
 assert.notEqual(key,original);
});
test('write failures still return a displayable derivative and failed conversions are not stored',async()=>{
 const storage=bucket();storage.state.uploadError=true;assert.ok(await storedDerivative(storage,original,variant));
 assert.equal(storage.objects.size,1);storage.objects.set(original,Buffer.from('not an image'));
 assert.equal(await storedDerivative(storage,original,variant),null);assert.equal(storage.writes.length,1);
});
test('transient reads do not regenerate or overwrite saved objects; supported not-found responses can generate them',async()=>{
 const storage=bucket();storage.state.downloadError={statusCode:'503'};
 await assert.rejects(storedDerivative(storage,original,variant),/unavailable/);assert.equal(storage.reads.length,1);assert.equal(storage.writes.length,0);
 storage.state.downloadError=null;
 const download=storage.download.bind(storage);
 storage.download=(key,options,parameters)=>key===original?download(key,options,parameters):{asStream:async()=>({data:null,error:{statusCode:'400',message:'Object not found'}})};
 assert.ok(await storedDerivative(storage,original,variant));assert.equal(storage.writes.length,1);
});
test('oversized and malformed stored derivatives fail before returning bytes',async()=>{
 const storage=bucket(),key=derivativeObjectPath(original,variant);storage.objects.set(key,Buffer.alloc(maxDerivativeBytes+1));
 await assert.rejects(storedDerivative(storage,original,variant),/too large/);
 storage.objects.set(key,Buffer.from('<svg>unsafe</svg>'));await assert.rejects(storedDerivative(storage,original,variant),/Invalid stored derivative/);
 assert.equal(storage.writes.length,0);
});
test('oversized original streams are bounded and never persisted',async()=>{
 const storage=bucket();storage.objects.set(original,Buffer.alloc(10*1024*1024+1));
 await assert.rejects(storedDerivative(storage,original,variant),/too large/);assert.equal(storage.writes.length,0);
});
test('the first image can be returned before background persistence is performed',async()=>{
 const storage=bucket(),tasks=[];
 const image=await storedDerivative(storage,original,variant,task=>tasks.push(task));
 assert.ok(image.bytes.length>0);assert.equal(storage.writes.length,0);assert.equal(tasks.length,1);
 await tasks[0]();assert.equal(storage.writes.length,1);
 const saved=await storedDerivative(storage,original,variant);assert.deepEqual(saved.bytes,image.bytes);assert.equal(storage.writes.length,1);
});
