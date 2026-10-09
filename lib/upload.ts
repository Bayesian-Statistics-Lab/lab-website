"use client";
export const maxUploadBytes=10*1024*1024;
export async function uploadFile(file:File,onStage?:(stage:string)=>void,{endpoint='/api/v1/admin/media',maxBytes=maxUploadBytes}:{endpoint?:string;maxBytes?:number}={}) {
  if(!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type))throw Error('JPG, PNG, WebP 또는 PDF 파일을 선택해주세요.');
  if(file.size===0||file.size>maxBytes)throw Error(`파일은 ${maxBytes/1024/1024}MB 이하로 선택해주세요.`);
  onStage?.('업로드 연결 중…');
  const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:file.name,type:file.type,size:file.size})});
  const data=await response.json().catch(()=>({error:'업로드 연결 응답을 확인할 수 없습니다.'}));
  if(!response.ok)throw Error(data.error||'업로드 연결에 실패했습니다.');
  onStage?.('파일 전송 중…');
  const {createClient}=await import('@supabase/supabase-js');
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key)throw Error('스토리지 연결이 설정되지 않았습니다.');
  const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  const {error}=await client.storage.from('lab-media').uploadToSignedUrl(data.path,data.token,file,{contentType:file.type});
  if(error)throw Error('파일 전송에 실패했습니다. 잠시 후 다시 선택해주세요.');
  return {path:data.path,url:'/api/media/'+data.path};
}
