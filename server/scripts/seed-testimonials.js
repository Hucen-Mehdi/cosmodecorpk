const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { Pool } = require('pg');

const pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : new Pool({
        host: 'localhost',
        port: 5432,
        database: 'cosmodecorpk',
        user: 'postgres',
        password: 'postgres'
    });

const testimonials = [
    {
        id: 1,
        name: "Sarah Ahmed",
        location: "Karachi",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        rating: 5,
        text: "Absolutely love my artificial plants from CosmoDecorPK! They look so real and the quality is amazing. My home looks so lively now!"
    },
    {
        id: 2,
        name: "Ali Hassan",
        location: "Lahore",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        rating: 5,
        text: "Best home decor shopping experience ever. The Ramadan collection was beautiful and delivery was super fast. Highly recommend!"
    },
    {
        id: 3,
        name: "Fatima Khan",
        location: "Islamabad",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
        rating: 5,
        text: "The wall mirrors and corner decor pieces exceeded my expectations. Beautiful designs and excellent craftsmanship!"
    }
];

async function seedTestimonials() {
    try {
        console.log('🌱 Seeding testimonials...');

        // Clear existing just in case to avoid duplicates if ID constraint exists, 
        // though ON CONFLICT covers it, clearing ensures we have exactly these 3.
        await pool.query('DELETE FROM testimonials');

        for (const t of testimonials) {
            await pool.query(
                `INSERT INTO testimonials (id, name, location, image_url, rating, message) 
                 VALUES ($1, $2, $3, $4, $5, $6) 
                 ON CONFLICT (id) DO UPDATE 
                 SET name = EXCLUDED.name, 
                     location = EXCLUDED.location, 
                     image_url = EXCLUDED.image_url, 
                     rating = EXCLUDED.rating, 
                     message = EXCLUDED.message`,
                [t.id, t.name, t.location, t.image, t.rating, t.text]
            );
        }

        // Reset sequence
        await pool.query("SELECT setval('testimonials_id_seq', (SELECT MAX(id) FROM testimonials))");

        console.log('✅ Testimonials seeded successfully.');
    } catch (err) {
        console.error('❌ Failed to seed testimonials:', err);
    } finally {
        await pool.end();
    }
}

seedTestimonials();
