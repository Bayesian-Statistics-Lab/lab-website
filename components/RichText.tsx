import {richTextPrefix,cleanRichHtml} from '@/lib/rich-text';
export default function RichText({body}:{body:string}){return body.startsWith(richTextPrefix)?<div className="rich-content" dangerouslySetInnerHTML={{__html:cleanRichHtml(body.slice(richTextPrefix.length))}}/>:<p className="prose">{body}</p>}
