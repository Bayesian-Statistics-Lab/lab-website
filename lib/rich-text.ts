import sanitizeHtml from 'sanitize-html';
export const richTextPrefix='<!--bsl-richtext-->';
export function cleanRichHtml(value:string){
 return sanitizeHtml(value,{
  allowedTags:['p','br','strong','em','u','s','h2','h3','ul','ol','li','blockquote','pre','code','a','hr','img'],
  allowedAttributes:{a:['href','target','rel'],img:['src','alt','title']},
  exclusiveFilter:frame=>frame.tag==='img'&&!frame.attribs.src,
  allowedSchemes:['https','http','mailto'],allowProtocolRelative:false,
  transformTags:{img:(_tag,attrs)=>({tagName:'img',attribs:{src: /^(https:\/\/|\/assets\/|\/api\/media\/)/.test(attrs.src||'')&&!attrs.src.startsWith('//')?attrs.src:'',alt:attrs.alt||'',title:attrs.title||''}}),a:(_tag,attrs)=>({tagName:'a',attribs:{href:attrs.href||'',rel:'noopener noreferrer',...(attrs.target==='_blank'?{target:'_blank'}:{})}})},
 });
}
export function normalizeBody(value:string){return value.startsWith(richTextPrefix)?richTextPrefix+cleanRichHtml(value.slice(richTextPrefix.length)):value;}
export function bodyExcerpt(value:string){return sanitizeHtml(value.replace(richTextPrefix,''),{allowedTags:[],allowedAttributes:{}}).replace(/\s+/g,' ').slice(0,150);}

export function richMediaPaths(value:string){return Array.from(cleanRichHtml(value.replace(richTextPrefix,'')).matchAll(/<img\b[^>]*\bsrc="(\/api\/media\/[^"]+)"/g),m=>m[1].slice('/api/media/'.length));}
