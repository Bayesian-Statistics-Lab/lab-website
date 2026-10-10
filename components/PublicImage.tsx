import {animatedImageUrl} from '@/lib/media-variants';
import DefaultArtwork from './DefaultArtwork';
import {artworkFor} from '@/lib/default-artwork';
import Image from 'next/image';
import type {ImgHTMLAttributes} from 'react';
type Props=Omit<ImgHTMLAttributes<HTMLImageElement>,'width'|'height'|'src'> & {src:string;width:number;height:number;sizes?:string;priority?:boolean};
// Only publicly rendered site assets use the optimizer. Account/editor previews stay private.
export default function PublicImage({src,alt='',width,height,sizes,priority=false,...props}:Props){
 if(artworkFor(src))return <DefaultArtwork src={src} alt={alt} width={width} height={height} className={props.className} style={props.style}/>;
 const optimize=/^\/(?:api\/media|assets)\/.*\.(?:jpe?g|png|webp)$/i.test(src);
 if(!optimize)return <img {...props} src={animatedImageUrl(src)} alt={alt} width={width} height={height} loading={priority?'eager':props.loading||'lazy'} fetchPriority={priority?'high':props.fetchPriority}/>;
 return <Image {...props} src={src} alt={alt} width={width} height={height} sizes={sizes} priority={priority} loading={priority?undefined:props.loading||'lazy'}/>;
}
