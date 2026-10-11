import type {ImgHTMLAttributes} from 'react';
import {thumbnailUrl} from '@/lib/media-variants';
import PublicImage from './PublicImage';

type Props=Omit<ImgHTMLAttributes<HTMLImageElement>,'src'|'srcSet'|'width'|'height'> & {
 src:string;width:number;height:number;priority?:boolean;
};

// Public portraits share the media API's bounded, cached derivatives between views.
// GIFs, bundled artwork and external URLs keep their existing rendering behavior.
export default function MemberPortrait({src,width,height,alt='',sizes,priority=false,loading='lazy',...props}:Props){
 const small=thumbnailUrl(src,320),large=thumbnailUrl(src,640);
 if(small===src||src.endsWith('.gif'))return <PublicImage {...props} src={src} width={width} height={height} alt={alt} sizes={sizes} priority={priority} loading={loading}/>;
 return <img {...props} src={small} srcSet={`${small} 320w, ${large} 640w`}
  sizes={sizes||`${width}px`} width={width} height={height} alt={alt}
  loading={priority?'eager':loading} fetchPriority={priority?'high':props.fetchPriority}
  decoding={props.decoding||'async'}/>;
}
