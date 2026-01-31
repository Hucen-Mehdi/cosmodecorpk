import { Metadata } from 'next';
export const dynamic = "force-dynamic";
import AccountClient from './AccountClient';

export const metadata: Metadata = {
    title: 'My Account | CosmoDecorPK',
    description: 'Manage your profile, view order history, and update your information at CosmoDecorPK.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function AccountPage() {
    return <AccountClient />;
}
