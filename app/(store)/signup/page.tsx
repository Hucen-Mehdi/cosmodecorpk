import { Metadata } from 'next';
import { Suspense } from 'react';
import SignupClient from './SignupClient';

export const metadata: Metadata = {
    title: 'Sign Up | CosmoDecorPK',
    description: 'Create a CosmoDecorPK account to start shopping for premium home decor and artificial plants.',
};

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            <SignupClient />
        </Suspense>
    );
}
