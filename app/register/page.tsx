import Link from 'next/link';
import RegistrationForm from '@/components/RegistrationForm';
export const metadata={title:'구성원 회원가입'};
export default function Register(){return <main className="account-wrap"><p className="kicker">JOIN THE LAB</p><h1>함께 연구하는 사람들</h1><RegistrationForm/><p>이미 계정이 있나요? <Link className="more" href="/admin/login">로그인</Link></p></main>}
