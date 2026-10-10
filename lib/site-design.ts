import {defaultTheme,readTheme,type SiteTheme} from './theme.ts';
import {defaultBrand,readBrand,type BrandLabel} from './brand.ts';
export type SiteDesign=SiteTheme&BrandLabel;
export const defaultDesign:SiteDesign={...defaultTheme,...defaultBrand};
export function readDesign(body:string|null|undefined):SiteDesign{let value:unknown=null;try{value=JSON.parse(body||'null')}catch{}return {...readTheme(body),...readBrand(value)}}
