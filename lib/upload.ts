'use client';
export const maxUploadBytes=10*1024*1024;
async function optimizedImage(file:File,profile=false){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size<(profile?150000:500000))return file;
 let bitmap:ImageBitmap|undefined;
 try{bitmap=await createImageBitmap(file);const scale=Math.min(1,(profile?1000:1920)/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height);const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',profile?.82:.84));return blob&&blob.size<file.size?new File([blob],file.name.replace(/\.[^.]+$/,'.webp'),{type:blob.type}):file}catch{return file}finally{bitmap?.close()}
}
export async function uploadFile(original:File,onStage?:(stage:string)=>void,{endpoint='/api/v1/admin/media',maxBytes=maxUploadBytes,category}:{endpoint?:string;maxBytes?:number;category?:string}={}){
 if(!['image/jpeg','image/png','image/webp','image/gif','application/pdf'].includes(original.type))throw Error('JPG, PNG, WebP, GIF 또는 PDF 파일을 선택해주세요.');
 if(original.size===0||original.size>maxBytes)throw Error(`파일은 ${maxBytes/1024/1024}MB 이하로 선택해주세요.`);
 onStage?.('이미지 준비 중…');const file=await optimizedImage(original,endpoint==='/api/account/photo');
 onStage?.('업로드 연결 중…');const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:file.name,type:file.type,size:file.size,category})});const data=await response.json().catch(()=>({error:'업로드 연결 응답을 확인할 수 없습니다.'}));if(!response.ok)throw Error(data.error||'업로드 연결에 실패했습니다.');
 if(!data.signedUrl)throw Error('업로드 주소를 확인할 수 없습니다.');
 await new Promise<void>((resolve,reject)=>{const xhr=new XMLHttpRequest();xhr.open('PUT',data.signedUrl);xhr.timeout=120000;xhr.setRequestHeader('Content-Type',file.type);xhr.setRequestHeader('Cache-Control','max-age=3600');xhr.setRequestHeader('x-upsert','false');xhr.upload.onprogress=e=>{if(e.lengthComputable)onStage?.(`파일 전송 중… ${Math.round(e.loaded/e.total*100)}%`)};xhr.onload=()=>xhr.status>=200&&xhr.status<300?resolve():reject(Error('파일 전송에 실패했습니다. 다시 시도해주세요.'));xhr.onerror=xhr.ontimeout=()=>reject(Error('전송 연결이 끊겼습니다. 다시 시도해주세요.'));xhr.send(file)});
 return {path:data.path,url:'/api/media/'+data.path};
}
