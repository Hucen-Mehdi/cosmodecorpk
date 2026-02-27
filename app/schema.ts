export const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "CosmoDecorPK",
    "url": "https://www.cosmodecorpk.com",
    "logo": "https://www.cosmodecorpk.com/logo.png",
    "image": "https://www.cosmodecorpk.com/store-front.jpg",
    "description": "Pakistan premier online store for artificial plants, home decor, and gift items.",
    "address": {
        "@type": "PostalAddress",
        "addressCountry": "PK"
    },
    "priceRange": "₨500 - ₨50,000",
    "telephone": "+92-320-9937113",
    "email": "info@cosmodecorpk.com",
    "sameAs": [
        "https://www.facebook.com/cosmodecorpk",
        "https://www.instagram.com/cosmodecorpk",
        "https://www.tiktok.com/@cosmodecorpk"
    ],
    "areaServed": ["Karachi", "Lahore", "Islamabad", "Faisalabad", "Rawalpindi", "Multan", "Gujranwala", "Peshawar", "Quetta", "Sialkot", "Bahawalpur", "Sargodha", "Sukkur", "Larkana", "Sheikhupura", "Mirpur Khas", "Rahim Yar Khan", "Sahiwal", "Okara", "Wah Cantonment"],
    "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Home Decor & Artificial Plants",
        "itemListElement": [
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Product",
                    "name": "Artificial Plants",
                    "description": "Premium quality artificial plants for home and office decor."
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Product",
                    "name": "Wall Decor",
                    "description": "Modern and rustic wall decor items."
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Product",
                    "name": "Wedding Decor",
                    "description": "Luxury wedding decoration items."
                }
            }
        ]
    }
}
