import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultBanner,readBanner} from '../lib/banner-settings.ts';
import {contentSchema} from '../lib/content-schema.ts';

test('legacy banner keeps the original overlay and existing image and text',()=>{
 const banner=readBanner('Lab',JSON.stringify({image:'/api/media/lab/hero.gif',subtitle:'Welcome'}));
 assert.equal(banner.overlayAlpha,1);assert.equal(banner.image,'/api/media/lab/hero.gif');assert.equal(banner.title,'Lab');assert.equal(banner.subtitle,'Welcome');
});
test('banner alpha round-trips including fully transparent and original overlay',()=>{
 for(const overlayAlpha of [0,0.37,1]){
  const banner={...defaultBanner,overlayAlpha};const {title,...body}=banner;
  assert.deepEqual(readBanner(title,JSON.stringify(body)),banner);
  assert.equal(contentSchema.safeParse({type:'pages',slug:'home/banner',title,body:JSON.stringify(body)}).success,true);
 }
});
test('banner rejects out of range or nonnumeric alpha and safely reads legacy invalid values',()=>{
 for(const overlayAlpha of [-0.01,1.01,'0.5',null]){
  const body=JSON.stringify({overlayAlpha});
  assert.equal(contentSchema.safeParse({type:'pages',slug:'home/banner',title:'Lab',body}).success,false);
  assert.equal(readBanner('Lab',body).overlayAlpha,1);
 }
 assert.equal(readBanner('Lab','null').overlayAlpha,1);
 assert.equal(contentSchema.safeParse({type:'pages',slug:'about/introduction',title:'Lab',body:'<p>Body</p>'}).success,true);
});
