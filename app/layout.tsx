import type {Metadata} from 'next';import Header from '@/components/Header';import Footer from '@/components/Footer';import './globals.css';
export const metadata:Metadata={title:{default:'베이즈통계 연구실 | 전남대학교',template:'%s | 베이즈통계 연구실'},description:'전남대학교 통계학과 이광민 교수님의 베이즈통계 연구실. 연구 분야, 구성원, 논문과 연구실 소식을 소개합니다.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body><Header/>{children}<Footer/></body></html>}
