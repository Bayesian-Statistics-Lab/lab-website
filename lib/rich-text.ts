import sanitizeHtml from 'sanitize-html';
export const richTextPrefix='<!--bsl-richtext-->';
export function cleanRichHtml(value:string){
 return sanitizeHtml(value,{
  allowedTags:['p','br','strong','em','u','s','h2','h3','ul','ol','li','blockquote','pre','code','a','hr'],
  allowedAttributes:{a:['href','target','rel']},
  allowedSchemes:['https','http','mailto'],allowProtocolRelative:false,
  transformTags:{a:(_tag,attrs)=>({tagName:'a',attribs:{href:attrs.href||'',rel:'noopener noreferrer',...(attrs.target==='_blank'?{target:'_blank'}:{})}})},
 });
}
export function normalizeBody(value:string){return value.startsWith(richTextPrefix)?richTextPrefix+cleanRichHtml(value.slice(richTextPrefix.length)):value;}
export function bodyExcerpt(value:string){return sanitizeHtml(value.replace(richTextPrefix,''),{allowedTags:[],allowedAttributes:{}}).replace(/\s+/g,' ').slice(0,150);}
