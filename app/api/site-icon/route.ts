import {NextRequest} from 'next/server';
import {ImageResponse} from 'next/og';
import {createElement} from 'react';
import {iconTheme,themeIconSvg} from '@/lib/site-icon';
export const runtime='nodejs';
export async function GET(req:NextRequest){
 const theme=iconTheme(req.nextUrl.searchParams.get('theme'));
 const format=req.nextUrl.searchParams.get('format')||'svg';
 const size=Number(req.nextUrl.searchParams.get('size')||32);
 if(!theme||!['svg','png'].includes(format)||![32,180].includes(size))return new Response('Invalid icon',{status:400});
 const svg=themeIconSvg(theme);
 const headers={'Cache-Control':'public, max-age=31536000, immutable'};
 if(format==='svg')return new Response(svg,{headers:{...headers,'Content-Type':'image/svg+xml','X-Content-Type-Options':'nosniff'}});
 return new ImageResponse(createElement('img',{src:'data:image/svg+xml;base64,'+Buffer.from(svg).toString('base64'),width:size,height:size}),{width:size,height:size,headers});
}
