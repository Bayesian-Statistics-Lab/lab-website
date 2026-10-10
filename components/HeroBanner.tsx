'use client';
import PublicImage from './PublicImage';
import {useEffect,useState} from 'react';import Link from 'next/link';
import type {Banner} from '@/lib/banner-settings';
export default function HeroBanner({hero}:{hero:Banner}){
 const [paused,setPaused]=useState(false);const animated=/\.gif(?:[?#]|$)/i.test(hero.image);
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');setPaused(media.matches);const change=()=>setPaused(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change)},[]);
 return <section className="hero hero-light"><PublicImage width={1920} height={800} sizes="100vw" priority className="hero-media" decoding="async" src={paused&&animated?'/assets/illustrations/posterior.svg':hero.image} alt=""/><div className="hero-overlay" style={{opacity:hero.overlayAlpha}}/><div className="container"><span className="eyebrow">CHONNAM NATIONAL UNIVERSITY · DEPARTMENT OF STATISTICS</span><h1 style={{whiteSpace:'pre-line'}}>{hero.title}</h1><p style={{whiteSpace:'pre-line'}}>{hero.subtitle}</p><Link href={hero.buttonHref.startsWith('/')&&!hero.buttonHref.startsWith('//')?hero.buttonHref:'/about/introduction'} className="outline-button">{hero.buttonLabel}</Link></div></section>;
}
