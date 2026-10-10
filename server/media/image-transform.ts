import sharp from 'sharp';
export const maxDerivativeBytes=1400000;
// Bound input, frame count, CPU time and cache entry size. Preserve originals on failure.
export async function imageDerivative(input:Uint8Array,{width,animated}:{width:number;animated:boolean}){
 try{
  const source=Buffer.from(input);if(source.length>10*1024*1024)return null;
  const metadata=await sharp(source,{limitInputPixels:32000000}).metadata();
  if(!['jpeg','png','webp','gif'].includes(metadata.format||''))return null;
  const pages=metadata.pages||1;
  if(animated&&(pages>120||(metadata.width||0)*(metadata.pageHeight||metadata.height||0)*pages>32000000))return null;
  const result=await sharp(source,{animated,limitInputPixels:32000000}).rotate().resize({width,withoutEnlargement:true}).webp({quality:animated?72:80,effort:2,...(animated?{loop:metadata.loop,delay:metadata.delay}:{})}).timeout({seconds:3}).toBuffer();
  if(result.length>maxDerivativeBytes||animated&&result.length>=source.length)return null;
  return {bytes:result,type:'image/webp',sourceBytes:source.length};
 }catch{return null}
}
