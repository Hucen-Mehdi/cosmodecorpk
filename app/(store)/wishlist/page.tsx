import { Metadata } from 'next';
import WishlistClient from './WishlistClient';

export const metadata: Metadata = {
    title: 'My Wishlist | CosmoDecorPK',
    description: 'View your saved items at CosmoDecorPK. Save your favorite artificial plants and home decor items for later.',
};

export default function WishlistPage() {
    return <WishlistClient />;
}
