import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultTheme,readTheme,themeVariables,themePresets,themeWarnings,contrastRatio} from '../lib/theme.ts';
import {themeSchema} from '../server/theme/theme.dto.ts';
import {createThemeService} from '../server/theme/theme.service.ts';
test('missing and malformed theme settings preserve the original theme',()=>{
 for(const body of [null,'','invalid','null','[]'])assert.deepEqual(readTheme(body),defaultTheme);
 const variables=themeVariables(defaultTheme);assert.equal(variables['--blue'],'#435bb2');assert.equal(variables['--deep'],'#172446');assert.equal(variables['--line'],'#e2e6ef');assert.equal(variables['--muted'],'#667287');assert.equal(variables['--footer-text'],'#e1e7f5');
});
test('theme accepts only the declared six digit colors and rejects CSS injection and unknown fields',()=>{
 assert.equal(themeSchema.safeParse(defaultTheme).success,true);
 for(const primary of ['red','#fff','var(--blue)','#ffffff;display:none','url(https://example.com)',null])assert.equal(themeSchema.safeParse({...defaultTheme,primary}).success,false);
 assert.equal(themeSchema.safeParse({...defaultTheme,role:'admin'}).success,false);
 assert.equal(themeSchema.safeParse({primary:'#ffffff'}).success,false);
 assert.equal(readTheme(JSON.stringify({...defaultTheme,primary:'red'})).primary,defaultTheme.primary);
});
test('presets round trip and produce valid CSS tokens with accessible foreground colors',()=>{
 for(const preset of themePresets){
  assert.deepEqual(readTheme(JSON.stringify(preset.colors)),preset.colors);
  assert.equal(themeSchema.safeParse(preset.colors).success,true);
  assert.deepEqual(themeWarnings(preset.colors),[]);
  const variables=themeVariables(preset.colors);assert.ok(contrastRatio(variables['--on-primary'],variables['--blue'])>=4.5);
 }
 const light=themeVariables({...defaultTheme,primary:'#eeeeee'});assert.equal(light['--on-primary'],'#172446');
});
test('contrast warnings detect unreadable text on both backgrounds',()=>{
 assert.equal(contrastRatio('#000000','#ffffff'),21);
 assert.equal(themeWarnings({...defaultTheme,text:defaultTheme.surface}).length,1);
 assert.equal(themeWarnings({...defaultTheme,soft:defaultTheme.heading}).length,1);
});
test('theme service defaults missing settings and preserves read and write errors',async()=>{
 const calls=[];const repository={read:async()=>({data:null,error:null}),save:async theme=>{calls.push(theme);return {error:null}}};
 const service=createThemeService(repository);assert.deepEqual(await service.read(),{data:defaultTheme,error:null});assert.deepEqual(await service.save(themePresets[1].colors),{error:null});assert.deepEqual(calls,[themePresets[1].colors]);
 const error={message:'denied'};const failed=createThemeService({read:async()=>({data:null,error}),save:async()=>({error})});assert.equal((await failed.read()).error,error);assert.equal((await failed.save(defaultTheme)).error,error);
});
