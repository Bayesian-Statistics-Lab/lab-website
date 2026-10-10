import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultBrand,readBrand} from '../lib/brand.ts';
import {defaultDesign,readDesign} from '../lib/site-design.ts';
import {defaultTheme,themePresets} from '../lib/theme.ts';
import {themeSchema} from '../server/theme/theme.dto.ts';
import {themeIconKey} from '../lib/site-icon.ts';
test('existing color-only settings retain the original brand label',()=>{
 assert.deepEqual(readDesign(JSON.stringify(defaultTheme)),defaultDesign);
 assert.deepEqual(readDesign(null),defaultDesign);
 assert.deepEqual(themeSchema.parse(defaultTheme),defaultDesign);
});
test('brand name and multiline subtitle round trip and allow hiding only the subtitle',()=>{
 const design={...defaultTheme,brandName:'통계 연구실',brandSubtitle:'Statistics Lab\nCHONNAM NATIONAL UNIVERSITY'};
 assert.deepEqual(readDesign(JSON.stringify(themeSchema.parse(design))),design);
 assert.equal(themeSchema.safeParse({...design,brandSubtitle:''}).success,true);
 assert.equal(readBrand({brandName:'  연구실  ',brandSubtitle:''}).brandSubtitle,'');
 assert.equal(readBrand({brandName:'  연구실  '}).brandName,'연구실');
});
test('brand validation rejects empty, oversized and multiline names and oversized subtitles',()=>{
 for(const brandName of ['', '   ','x'.repeat(61),'line\nline'])assert.equal(themeSchema.safeParse({...defaultDesign,brandName}).success,false);
 assert.equal(themeSchema.safeParse({...defaultDesign,brandSubtitle:'x'.repeat(201)}).success,false);
 assert.deepEqual(readBrand({brandName:32,brandSubtitle:32}),defaultBrand);
});
test('color preset changes retain brand text and brand changes do not invalidate icon identity',()=>{
 const design={...defaultDesign,brandName:'다른 연구실',brandSubtitle:'Custom copy'};
 const selected={...design,...themePresets[1].colors};
 assert.equal(readDesign(JSON.stringify(selected)).brandName,'다른 연구실');
 assert.equal(themeIconKey(design),themeIconKey(defaultTheme));
});
