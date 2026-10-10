import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultArtwork,artworkFor,artworkMarkup,artworkColors} from '../lib/default-artwork.ts';
import {defaultTheme,themePresets,themeVariables} from '../lib/theme.ts';
test('only bundled default vectors use theme artwork rendering',()=>{
 assert.equal(Object.keys(defaultArtwork).length,4);
 for(const src of ['/api/media/lab/custom.svg','https://example.com/logo.svg','/assets/unknown.svg','/assets/illustrations/login-still-life.webp']){assert.equal(artworkFor(src),undefined);assert.equal(artworkMarkup(src,'test'),null)}
});
test('original artwork colors stay identical by default and follow custom themes',()=>{
 const original=themeVariables(defaultTheme),custom=themeVariables(themePresets[1].colors);
 for(const color of artworkColors){const key='--art-'+color.slice(1);assert.equal(original[key],color);assert.match(custom[key],/^#[0-9a-f]{6}$/);assert.notEqual(custom[key],original[key])}
});
test('gradient IDs are isolated between instances and every reference resolves',()=>{
 const src='/assets/brand/lab-mark.svg';const first=artworkMarkup(src,'first'),second=artworkMarkup(src,'second');
 assert.notEqual(first,second);
 for(const markup of [first,second]){
  const ids=new Set([...markup.matchAll(/id="([^"]+)"/g)].map(x=>x[1]));
  for(const reference of markup.matchAll(/url\(#([^)]+)\)/g))assert.ok(ids.has(reference[1]));
 }
});
