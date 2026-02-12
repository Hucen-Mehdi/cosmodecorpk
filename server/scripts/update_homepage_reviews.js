const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

const NEW_TESTIMONIALS = [
    {
        name: "Alina",
        location: "Karachi",
        rating: 5,
        text: "I ordered this mirror and honestly I wasn’t expecting it to look this good! The quality is solid, finishing is neat and it completely changed the look of my room. Packing was safe too, it arrived without any damage. Totally worth it!",
        image: "https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1757590804__whatsappimage2025-09-11at43909pm__original.jpeg"
    },
    {
        name: "Hamid Khan",
        location: "Lahore",
        rating: 5,
        text: "I'm absolutely thrilled with Cosmodecor! As someone who's always on the lookout for unique and stylish home decor and mirrors, I stumbled upon this page, and it's been a revelation. The variety of products is staggering, and the quality is top-notch.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
    },
    {
        name: "Bisma",
        location: "Islamabad",
        rating: 5,
        text: "I received my parcel 📦 top notch quality carefully packed and I literally loved the plant and the price is so reasonable 🌟 will shop again Insha'Allah",
        image: "https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1761290589__1000662665__original.jpg"
    }
];

async function update() {
    try {
        await client.connect();
        console.log("Connected to DB");

        // Clear existing
        await client.query("TRUNCATE testimonials");
        console.log("Cleared existing testimonials");

        for (const t of NEW_TESTIMONIALS) {
            await client.query(
                `INSERT INTO testimonials (name, location, rating, message, image_url) VALUES ($1, $2, $3, $4, $5)`,
                [t.name, t.location, t.rating, t.text, t.image]
            );
            console.log(`Inserted testimonial: ${t.name}`);
        }

        console.log("Done!");
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

update();
