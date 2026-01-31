import { Metadata } from 'next';
import { Suspense } from 'react';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
    title: 'Login | CosmoDecorPK',
    description: 'Log in to your CosmoDecorPK account to track orders and manage your profile.',
};

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            <LoginClient />
        </Suspense>
    );
}
