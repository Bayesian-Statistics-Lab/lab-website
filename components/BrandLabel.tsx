import {defaultBrand,type BrandLabel as Label} from '@/lib/brand';
export default function BrandLabel({brand=defaultBrand}:{brand?:Label}){return <span className="brand-label"><strong>{brand.brandName}</strong>{brand.brandSubtitle&&<small>{brand.brandSubtitle}</small>}</span>}
