import {richMediaPaths,cleanRichHtml} from './rich-text.ts';
const prefix='/api/media/';
export function publicMediaPaths(members:{photo_url?:string|null;bio?:string|null}[],posts:{body?:string|null;category?:string}[],pages:{slug:string;body?:string|null}[]){
 const paths=new Set<string>();
 const add=(url:unknown)=>{if(typeof url==='string'&&url.startsWith(prefix)){const path=url.slice(prefix.length);if(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp|gif|pdf)$/.test(path))paths.add(path)}};
 const body=(value:string)=>richMediaPaths(value).forEach(path=>add(prefix+path));
 for(const member of members){add(member.photo_url);body(member.bio||'')}
 for(const post of posts){body(post.body||'');if(post.category==='forms'){for(const match of cleanRichHtml(post.body||'').matchAll(/<a\b[^>]*\bhref="(\/api\/media\/[^"]+\.pdf)"/g))add(match[1]);}}
 for(const page of pages){body(page.body||'');try{const value=JSON.parse(page.body||'{}');if(['home/banner','settings/auth'].includes(page.slug))add(value.image);if(page.slug==='settings/research'&&Array.isArray(value.cards))for(const card of value.cards)add(card.image)}catch{}}
 return [...paths];
}
