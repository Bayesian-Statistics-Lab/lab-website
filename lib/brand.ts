export type BrandLabel={brandName:string;brandSubtitle:string};
export const defaultBrand:BrandLabel={brandName:'베이즈통계 연구실',brandSubtitle:'Bayesian Statistics Laboratory\nCHONNAM NATIONAL UNIVERSITY'};
export function readBrand(value:unknown):BrandLabel{
 const source=value as Partial<BrandLabel>|null;
 const name=typeof source?.brandName==='string'?source.brandName.trim():'';
 const subtitle=typeof source?.brandSubtitle==='string'?source.brandSubtitle.trim():null;
 return {brandName:name&&name.length<=60&&!name.includes('\n')?name:defaultBrand.brandName,brandSubtitle:subtitle!==null&&subtitle.length<=200?subtitle:defaultBrand.brandSubtitle};
}
