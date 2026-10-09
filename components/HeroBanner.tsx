'use client';
import {useEffect,useState} from 'react';import Link from 'next/link';
type Banner={title:string;subtitle:string;image:string;buttonHref:string;buttonLabel:string};
export default function HeroBanner({hero}:{hero:Banner}){
 const [paused,setPaused]=useState(false);const animated=/\.gif(?:[?#]|$)/i.test(hero.image);
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');setPaused(media.matches);const change=()=>setPaused(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change)},[]);
 return <section className="hero hero-light"><img className="hero-media" src={paused&&animated?'/assets/illustrations/posterior.svg':hero.image} alt=""/><div className="hero-overlay"/><div className="container"><span className="eyebrow">CHONNAM NATIONAL UNIVERSITY · DEPARTMENT OF STATISTICS</span><h1 style={{whiteSpace:'pre-line'}}>{hero.title}</h1><p style={{whiteSpace:'pre-line'}}>{hero.subtitle}</p><Link href={hero.buttonHref.startsWith('/')&&!hero.buttonHref.startsWith('//')?hero.buttonHref:'/about/introduction'} className="outline-button">{hero.buttonLabel}</Link></div>{animated&&<button className="banner-motion" type="button" onClick={()=>setPaused(!paused)} aria-pressed={paused}>{paused?'GIF 재생':'GIF 정지'}</button>}</section>;
}
