import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {thumbnailUrl,animatedImageUrl,mediaVariant} from '../lib/media-variants.ts';
import {imageDerivative,maxDerivativeBytes} from '../server/media/image-transform.ts';
import {boundedBytes,streamMedia} from '../server/media/media-transfer.ts';
const url='/api/media/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

test('local thumbnails are scoped by size and private account photos bypass public lookup',()=>{
 assert.equal(thumbnailUrl(url+'.webp',96,true),url+'.webp?w=96&private=1');
 assert.equal(thumbnailUrl('https://example.com/photo.jpg',96),'https://example.com/photo.jpg');
 assert.equal(animatedImageUrl(url+'.gif'),url+'.gif?w=960&animation=1');
 assert.equal(animatedImageUrl(url+'.webp'),url+'.webp');
 assert.equal(animatedImageUrl('https://example.com/a.gif'),'https://example.com/a.gif');
});
test('derivatives accept bounded sizes, exclude documents and require GIF for animation',()=>{
 for(const w of [96,320,640,960,1280])assert.deepEqual(mediaVariant(new URLSearchParams('w='+w),'webp'),{width:w,animated:false});
 for(const w of ['1','999999','NaN',''])assert.equal(mediaVariant(new URLSearchParams('w='+w),'gif'),null);
 assert.equal(mediaVariant(new URLSearchParams('w=640'),'pdf'),null);
 assert.equal(mediaVariant(new URLSearchParams('w=640&animation=1'),'png'),null);
 assert.deepEqual(mediaVariant(new URLSearchParams('w=960&animation=1'),'gif'),{width:960,animated:true});
});
test('static thumbnails resize without enlarging and invalid/oversized data preserves the original',async()=>{
 const input=await sharp({create:{width:300,height:180,channels:4,background:{r:10,g:70,b:130,alpha:0.4}}}).png().toBuffer();
 const result=await imageDerivative(input,{width:96,animated:false});assert.ok(result);assert.equal(result.type,'image/webp');assert.ok(result.bytes.length<=maxDerivativeBytes);
 const meta=await sharp(result.bytes).metadata();assert.equal(meta.width,96);assert.equal(meta.height,58);assert.equal(meta.hasAlpha,true);
 assert.equal((await sharp((await imageDerivative(input,{width:640,animated:false})).bytes).metadata()).width,300);
 assert.equal(await imageDerivative(Buffer.from('not an image'),{width:96,animated:false}),null);
 assert.equal(await imageDerivative(Buffer.alloc(10*1024*1024+1),{width:96,animated:false}),null);
});
test('animated WebP preserves every frame, timing and loop while reducing a representative GIF',async()=>{
 const w=1200,h=600,pixels=Buffer.alloc(w*h*3*3);
 for(let y=0;y<h*3;y++)for(let x=0;x<w;x++){const i=(y*w+x)*3;pixels[i]=x%256;pixels[i+1]=y%256;pixels[i+2]=Math.floor(y/h)*60;}
 const gif=await sharp(pixels,{raw:{width:w,height:h*3,channels:3,pageHeight:h}}).gif({delay:[80,120,160],loop:2}).toBuffer();
 const result=await imageDerivative(gif,{width:640,animated:true});assert.ok(result);assert.ok(result.bytes.length<gif.length);
 const meta=await sharp(result.bytes,{animated:true}).metadata();assert.equal(meta.pages,3);assert.equal(meta.width,640);assert.equal(meta.pageHeight,320);assert.equal(meta.loop,2);assert.deepEqual(meta.delay,[80,120,160]);
});
test('animation with too many frames safely falls back',async()=>{
 const pixels=Buffer.alloc(16*16*3*121);for(let frame=0;frame<121;frame++){const offset=frame*16*16*3+frame*3;pixels.fill(255,offset,offset+3);}
 const gif=await sharp(pixels,{raw:{width:16,height:16*121,channels:3,pageHeight:16}}).gif({delay:Array(121).fill(100)}).toBuffer();
 assert.equal((await sharp(gif).metadata()).pages,121);
 assert.equal(await imageDerivative(gif,{width:96,animated:true}),null);
});
test('bounded upstream reads reject large declared and streamed payloads and upstream errors',async()=>{
 assert.deepEqual(await boundedBytes(new Response(new Uint8Array([1,2,3])),3),new Uint8Array([1,2,3]));
 await assert.rejects(boundedBytes(new Response('small',{headers:{'Content-Length':'100'}}),10),/too large/);
 let cancelled=false;
 const stream=new ReadableStream({start(c){c.enqueue(new Uint8Array(3));c.enqueue(new Uint8Array(3));},cancel(){cancelled=true}});
 await assert.rejects(boundedBytes(new Response(stream),5),/too large/);assert.equal(cancelled,true);
 await assert.rejects(boundedBytes(new Response(null,{status:404})),/unavailable/);
});
test('media streams bytes without redirect and keeps caller cache/privacy policy',async()=>{
 const original=globalThis.fetch;
 try{
  globalThis.fetch=async()=>new Response('image',{headers:{'Content-Type':'image/webp','Content-Length':'5','ETag':'test'}});
  const response=await streamMedia('https://storage.example/image','private, no-store');
  assert.equal(response.status,200);assert.equal(response.headers.get('location'),null);assert.equal(response.headers.get('Cache-Control'),'private, no-store');assert.equal(response.headers.get('Content-Type'),'image/webp');assert.equal(await response.text(),'image');
  globalThis.fetch=async()=>new Response(null,{status:403});assert.equal((await streamMedia('https://storage.example/image','public')).status,502);
 }finally{globalThis.fetch=original}
});
