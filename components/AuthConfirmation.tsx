"use client";
import {useEffect} from 'react';
import Link from 'next/link';
export default function AuthConfirmation(){useEffect(()=>{window.history.replaceState(null,'','/auth/callback')},[]);return <main className="account-wrap auth-wrap"><section className="auth-card"><h1>가입 신청 안내</h1><p>이메일 인증은 필요하지 않습니다. 관리자 승인을 기다려주세요.</p><p>로그인하여 프로필을 관리할 수 있으며, 승인 후에는 구성원 페이지 공개와 게시글 작성·수정이 가능합니다.</p><div className="auth-footer-actions"><Link className="primary" href="/admin/login">로그인</Link><Link className="secondary-button" href="/">홈페이지로</Link></div></section></main>}
