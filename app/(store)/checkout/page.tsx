import { Metadata } from 'next';
export const dynamic = "force-dynamic";
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
    title: 'Checkout | CosmoDecorPK - Secure Purchase',
    description: 'Complete your purchase securely at CosmoDecorPK. Fast nationwide delivery across Pakistan.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function CheckoutPage() {
    return <CheckoutClient />;
}
