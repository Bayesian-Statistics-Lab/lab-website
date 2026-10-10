export const mediaWidths=[96,320,640,960,1280] as const;
const localImage=/^\/api\/media\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp|gif)$/;
export function thumbnailUrl(src:string,width:96|320|640,privatePhoto=false){return localImage.test(src)?src+'?w='+width+(privatePhoto?'&private=1':''):src}
export function animatedImageUrl(src:string){return localImage.test(src)&&src.endsWith('.gif')?src+'?w=960&animation=1':src}
export function mediaVariant(query:URLSearchParams,extension:string){
 const width=query.get('w');if(width===null)return null;
 if(!mediaWidths.includes(Number(width) as typeof mediaWidths[number]))return null;
 if(!['jpg','png','webp','gif'].includes(extension))return null;
 const animated=query.get('animation')==='1';if(animated&&extension!=='gif')return null;
 return {width:Number(width),animated};
}
