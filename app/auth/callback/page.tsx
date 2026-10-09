import AuthConfirmation from '@/components/AuthConfirmation';
export const metadata = { title: '가입 신청 안내', robots: { index: false, follow: false }, referrer: 'no-referrer' as const };
export default function Callback() { return <AuthConfirmation />; }
