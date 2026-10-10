import {defaultTheme,themeFields,themeVariables,type SiteTheme} from './theme.ts';
import {artworkFor,artworkMarkup} from './default-artwork.ts';
export function themeIconKey(theme:SiteTheme){return themeFields.map(([key])=>theme[key].slice(1).toLowerCase()).join('')}
export function iconTheme(key:string|null):SiteTheme|null{
 if(key===null)return defaultTheme;
 if(!/^[a-f0-9]{30}$/i.test(key))return null;
 return Object.fromEntries(themeFields.map(([field],i)=>[field,'#'+key.slice(i*6,i*6+6)])) as SiteTheme;
}
export function themeIconSvg(theme:SiteTheme){
 const src='/assets/brand/lab-mark.svg';const variables=themeVariables(theme);
 const markup=artworkMarkup(src,'icon')!.replace(/var\((--art-[a-f0-9]+),#[a-f0-9]+\)/g,(_,key)=>variables[key]);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${artworkFor(src)!.viewBox}" width="128" height="128">${markup}</svg>`;
}
