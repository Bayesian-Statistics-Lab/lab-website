import {z} from 'zod';

export const bannerAlphaSchema=z.number().min(0).max(1);
export const defaultBanner={title:'Bayesian Statistics\nLaboratory',subtitle:'Exploring uncertainty, building insight.\n전남대학교 통계학과 이광민 교수님 연구실',image:'/assets/illustrations/posterior.svg',buttonLabel:'LEARN MORE ↗',buttonHref:'/about/introduction',overlayAlpha:1};
export type Banner=typeof defaultBanner;

export function readBanner(title:string,body:string):Banner{
 try{
  const parsed=JSON.parse(body||'{}');
  const strings=Object.fromEntries(Object.entries(parsed).filter(([key,value])=>['subtitle','image','buttonLabel','buttonHref'].includes(key)&&typeof value==='string'));
  const alpha=bannerAlphaSchema.safeParse(parsed.overlayAlpha);
  return {...defaultBanner,title,...strings,overlayAlpha:alpha.success?alpha.data:defaultBanner.overlayAlpha};
 }catch{return {...defaultBanner,title}}
}

export function validBannerBody(body:string){
 try{
  const parsed=JSON.parse(body);
  return parsed!==null&&typeof parsed==='object'&&!Array.isArray(parsed)&&(parsed.overlayAlpha===undefined||bannerAlphaSchema.safeParse(parsed.overlayAlpha).success);
 }catch{return false}
}
