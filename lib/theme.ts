import {artworkColors} from './default-artwork.ts';
export type SiteTheme={primary:string;heading:string;text:string;surface:string;soft:string};
export const defaultTheme:SiteTheme={primary:'#435bb2',heading:'#26376f',text:'#243047',surface:'#ffffff',soft:'#eef1fb'};
export const themeFields:readonly [keyof SiteTheme,string][]=[['primary','대표 색상'],['heading','제목 색상'],['text','본문 색상'],['surface','기본 배경'],['soft','구분 영역 배경']];
export const themePresets=[{name:'기존 블루',colors:defaultTheme},{name:'포레스트',colors:{primary:'#28705a',heading:'#224b3c',text:'#293c34',surface:'#ffffff',soft:'#edf5f0'}},{name:'버건디',colors:{primary:'#923e55',heading:'#572e40',text:'#3e3038',surface:'#fffdfb',soft:'#f8eef1'}}];
const hex=/^#[0-9a-f]{6}$/i;
export function readTheme(body:string|null|undefined):SiteTheme{
 try{const parsed=JSON.parse(body||'null');return Object.fromEntries(themeFields.map(([key])=>[key,typeof parsed?.[key]==='string'&&hex.test(parsed[key])?parsed[key]:defaultTheme[key]])) as SiteTheme}catch{return {...defaultTheme}}
}
function rgb(color:string){return [1,3,5].map(i=>parseInt(color.slice(i,i+2),16))}
function luminance(color:string){return rgb(color).map(v=>v/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[0.2126,0.7152,0.0722][i],0)}
export function contrastRatio(a:string,b:string){const values=[luminance(a),luminance(b)].sort((a,b)=>b-a);return (values[0]+0.05)/(values[1]+0.05)}
function onColor(color:string){return contrastRatio(color,'#ffffff')>=contrastRatio(color,'#172446')?'#ffffff':'#172446'}
function mix(a:string,b:string,weight:number){const first=rgb(a),second=rgb(b);return '#'+first.map((v,i)=>Math.round(v*weight+second[i]*(1-weight)).toString(16).padStart(2,'0')).join('')}
export function themeWarnings(theme:SiteTheme){return [theme.text,theme.heading,theme.primary].some(color=>[theme.surface,theme.soft].some(bg=>contrastRatio(color,bg)<4.5))?['일부 글자와 배경의 대비가 낮습니다. 글자 색을 어둡게 하거나 배경을 밝게 조절해주세요.']:[]}
export function themeVariables(theme:SiteTheme):Record<string,string>{
 const original=themeFields.every(([key])=>theme[key].toLowerCase()===defaultTheme[key]);
 const artwork=Object.fromEntries(artworkColors.map(color=>{const channels=rgb(color);const light=(Math.max(...channels)+Math.min(...channels))/510;const weight=light>0.8?0.12:light>0.65?0.35:light>0.5?0.65:0.95;return ['--art-'+color.slice(1),original?color:mix(theme.primary,theme.soft,weight)]}));
 return {...artwork,'--blue':theme.primary,'--navy':theme.heading,'--text':theme.text,'--surface':theme.surface,'--soft':theme.soft,'--deep':original?'#172446':mix(theme.heading,'#000000',0.7),'--bg':original?'#f5f6fb':mix(theme.soft,theme.surface,0.5),'--line':original?'#e2e6ef':mix(theme.text,theme.surface,0.14),'--muted':original?'#667287':mix(theme.text,theme.surface,0.72),'--primary-hover':original?'#334893':mix(theme.primary,'#000000',0.8),'--on-primary-hover':onColor(original?'#334893':mix(theme.primary,'#000000',0.8)),'--on-primary':onColor(theme.primary),'--on-heading':onColor(theme.heading),'--on-deep':onColor(original?'#172446':mix(theme.heading,'#000000',0.7)),'--footer-text':original?'#e1e7f5':onColor(mix(theme.heading,'#000000',0.7)),'--footer-muted':original?'#b1beda':mix(onColor(mix(theme.heading,'#000000',0.7)),mix(theme.heading,'#000000',0.7),0.75),'--prose':original?'#526078':theme.text,'--hero-overlay':original?'linear-gradient(90deg,#f5f7fdf5 0%,#f1f4fce6 38%,#eef2fb30 100%)':`linear-gradient(90deg,${theme.surface}f5 0%,${theme.soft}e6 38%,${theme.soft}30 100%)`,'--hero-overlay-mobile':original?'linear-gradient(90deg,#f5f7fdf5,#f1f4fcca)':`linear-gradient(90deg,${theme.surface}f5,${theme.soft}ca)`};
}
