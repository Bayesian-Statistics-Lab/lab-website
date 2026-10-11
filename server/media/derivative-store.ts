import {imageDerivative,maxDerivativeBytes} from './image-transform.ts';
import {boundedBytes} from './media-transfer.ts';

type Bucket={
 download(path:string,options:{},parameters:{cache:'no-store';signal:AbortSignal}):{asStream():PromiseLike<{data:ReadableStream|null;error:unknown}>};
 upload(path:string,body:Buffer,options:{contentType:string;upsert:boolean;cacheControl:string}):Promise<{error:unknown}>;
};
type Variant={width:number;animated:boolean};
// Internal objects are never accepted as public API paths. Access is checked against
// the original UUID object before calling this repository. Keep them in the owner's
// folder and retain the original namespace's Storage permissions.
export function derivativeObjectPath(original:string,variant:Variant){
 const [owner,file]=original.split('/');
 return `${owner}/derived/${file}-w${variant.width}-a${variant.animated?1:0}-v1.webp`;
}
function missing(error:unknown){
 const value=error as {statusCode?:string|number;message?:string}|null;
 return String(value?.statusCode)==='404'||(String(value?.statusCode)==='400'&&value?.message==='Object not found');
}
export async function storedDerivative(bucket:Bucket,original:string,variant:Variant,schedule?:(write:()=>Promise<void>)=>void){
 const path=derivativeObjectPath(original,variant);
 const saved=await bucket.download(path,{}, {cache:'no-store',signal:AbortSignal.timeout(20000)}).asStream();
 if(saved.data){
  const bytes=Buffer.from(await boundedBytes(new Response(saved.data),maxDerivativeBytes));
  if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP')throw Error('Invalid stored derivative');
  return {bytes,type:'image/webp'};
 }
 if(saved.error&&!missing(saved.error))throw Error('Stored derivative unavailable');
 const source=await bucket.download(original,{}, {cache:'no-store',signal:AbortSignal.timeout(20000)}).asStream();
 if(source.error||!source.data)throw Error('Media unavailable');
 const result=await imageDerivative(await boundedBytes(new Response(source.data)),variant);
 if(!result)return null;
 // Storage failure must not prevent displaying the newly generated image.
 // A race between instances is harmless: both use the same deterministic bytes/key.
 const write=async()=>{try{await bucket.upload(path,result.bytes,{contentType:result.type,upsert:false,cacheControl:'3600'})}catch{}};
 // The route schedules persistence after sending bytes so first display never waits
 // for the extra Storage upload. Direct callers can await persistence instead.
 if(schedule)schedule(write);else await write();
 return result;
}
