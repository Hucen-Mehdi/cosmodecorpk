import { Metadata } from 'next'

export const siteMetadata: Metadata = {
    metadataBase: new URL('https://www.cosmodecorpk.com'),
    title: {
        default: 'CosmoDecorPK - Pakistan Premier Home Decor & Artificial Plants Store',
        template: '%s | CosmoDecorPK Pakistan'
    },
    description: 'Pakistan best online store for artificial plants, home decor, wall decor, room decor, wedding decor and gift items. Shop luxury Pakistani decor brands with fast delivery in Karachi, Lahore, Islamabad.',
    keywords: [
        'Home Decor Pakistan',
        'Artificial Plants Pakistan',
        'Decoration Items',
        'Modern Home Decor',
        'Wall Decor',
        'Room Decor',
        'Wedding Decor',
        'Gift Items',
        'Artificial Flowers',
        'Home Accessories',
        'Luxury Decor',
        'Pakistani Decor Brands',
        'Best Home Decor Store',
        'Online Decor Shopping Pakistan',
        'Interior Design Ideas',
        'Furniture Pakistan',
        'Rustic Decor',
        'Minimalist Decor',
        'Plant Decor',
        'Office Decor'
    ],
    authors: [{ name: 'CosmoDecorPK', url: 'https://www.cosmodecorpk.com' }],
    creator: 'CosmoDecorPK',
    publisher: 'CosmoDecorPK',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        title: 'CosmoDecorPK - Pakistan #1 Home Decor Store',
        description: 'Shop premium artificial plants, home decor & gift items. Best prices in Karachi, Lahore, Islamabad. Fast delivery across Pakistan.',
        url: 'https://www.cosmodecorpk.com',
        siteName: 'CosmoDecorPK Pakistan',
        images: [
            {
                url: 'https://www.cosmodecorpk.com/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'CosmoDecorPK - Pakistan Home Decor & Artificial Plants',
            },
        ],
        locale: 'en_PK',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'CosmoDecorPK - Pakistan Premier Decor Store',
        description: 'Shop artificial plants, home decor & gift items. Fast delivery in Karachi, Lahore, Islamabad.',
        images: ['https://www.cosmodecorpk.com/og-image.jpg'],
        creator: '@cosmodecorpk',
        site: '@cosmodecorpk',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: 'https://www.cosmodecorpk.com',
        languages: {
            'en-PK': 'https://www.cosmodecorpk.com',
            'ur-PK': 'https://www.cosmodecorpk.com/ur',
        },
    },
    category: 'ecommerce',
    classification: 'Home Decor Store',
}
