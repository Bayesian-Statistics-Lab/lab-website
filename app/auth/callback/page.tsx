import AuthConfirmation from '@/components/AuthConfirmation';
export const metadata = { title: '이메일 인증', robots: { index: false, follow: false }, referrer: 'no-referrer' as const };
export default function Callback() { return <AuthConfirmation />; }
