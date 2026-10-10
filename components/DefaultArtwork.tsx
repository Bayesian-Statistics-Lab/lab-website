import {useId,type CSSProperties} from 'react';
import {artworkFor,artworkMarkup} from '@/lib/default-artwork';
type Props={src:string;alt?:string;className?:string;width?:number;height?:number;style?:CSSProperties};
export default function DefaultArtwork({src,alt='',...props}:Props){
 const prefix='art-'+useId().replace(/[^a-zA-Z0-9_-]/g,'');
 const artwork=artworkFor(src);if(!artwork)return null;
 const markup=artworkMarkup(src,prefix)!;
 return <svg {...props} viewBox={artwork.viewBox} preserveAspectRatio="xMidYMid slice" role={alt?'img':undefined} aria-label={alt||undefined} aria-hidden={alt?undefined:true} focusable="false" dangerouslySetInnerHTML={{__html:markup}}/>;
}
