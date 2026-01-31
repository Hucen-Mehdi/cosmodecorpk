import { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
    title: 'Contact Us | CosmoDecorPK - Get in Touch',
    description: 'Have questions about our products or need help with an order? Contact CosmoDecorPK via WhatsApp, email, or our contact form. We\'re here to help!',
    openGraph: {
        title: 'Contact Us | CosmoDecorPK - Get in Touch',
        description: 'Get in touch with CosmoDecorPK for help with premium artificial plants and home decor.',
    },
};

export default function ContactPage() {
    return <ContactClient />;
}
