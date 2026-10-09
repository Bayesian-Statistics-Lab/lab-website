import type {SupabaseClient} from '@supabase/supabase-js';
// Read only the signature, even when an upstream server ignores Range.
export async function storageImageHeader(db:SupabaseClient,path:string){
 const {data,error}=await db.storage.from('lab-media').createSignedUrl(path,60);
 if(error||!data)throw Error('사진 검증 연결에 실패했습니다.');
 const response=await fetch(data.signedUrl,{headers:{Range:'bytes=0-11'},cache:'no-store',signal:AbortSignal.timeout(15000)});
 if(!response.ok||!response.body)throw Error('사진을 확인하지 못했습니다.');
 const reader=response.body.getReader();const header=new Uint8Array(12);let size=0;
 try{while(size<12){const {value,done}=await reader.read();if(done)break;const n=Math.min(value.length,12-size);header.set(value.subarray(0,n),size);size+=n}}finally{await reader.cancel()}
 return header.subarray(0,size);
}
