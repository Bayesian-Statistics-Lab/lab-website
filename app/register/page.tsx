import AuthLayout from '@/components/AuthLayout';import RegistrationForm from '@/components/RegistrationForm';
export const metadata={title:'구성원 회원가입'};export default function Register(){return <AuthLayout mode="register"><RegistrationForm/></AuthLayout>}
