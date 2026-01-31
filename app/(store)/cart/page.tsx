import { Metadata } from 'next';
export const dynamic = "force-dynamic";
import CartClient from './CartClient';

export const metadata: Metadata = {
    title: 'Your Shopping Cart | CosmoDecorPK',
    description: 'Review your items and proceed to checkout. Shop premium artificial plants and home decor at CosmoDecorPK.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function CartPage() {
    return <CartClient />;
}
