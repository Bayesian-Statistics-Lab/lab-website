export const imageTypes=['image/jpeg','image/png','image/webp','image/gif'] as const;
export const imageLimit=10*1024*1024;
export function ownImagePath(userId:string,path:string){return /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp|gif)$/.test(path)&&path.split('/')[0]===userId;}
export function imageSignature(bytes:Uint8Array,type:string){
 if(type==='image/gif')return ['GIF87a','GIF89a'].includes(String.fromCharCode(...bytes.slice(0,6)));
 if(type==='image/jpeg')return bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 if(type==='image/png')return [137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b);
 if(type==='image/webp')return String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
 return false;
}
