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

const REVIEWS_DATA = [
    { title: "", body: "I ordered this mirror and honestly I wasnâ€™t expecting it to look this good! The quality is solid, finishing is neat and it completely changed the look of my room. Packing was safe too, it arrived without any damage. Totally worth it!", rating: 5, date: "2025-09-11 11:40:04 UTC", reviewer: "ALINA", email: "malaikaajmal61@gmail.com", handle: "full-length-arch-mirror-with-iron-frame-stand-dome-design", pictures: "https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1757590804__whatsappimage2025-09-11at43909pm__original.jpeg" },
    { title: "", body: "I got it in their 3800 dealâ€¦ plant, planter & stones all together! Honestly so worth it and Iâ€™m loving the quality ðŸ™Œ", rating: 5, date: "2025-09-11 11:48:55 UTC", reviewer: "SABA", email: "ishaajmal430@gmail.com", handle: "artificial-dieffenbachia-plant-5-ft-in-grp-planter-tall-indoor-decorative-plant-for-home-office-decoror", pictures: "" },
    { title: "", body: "catesfieddddd customerr !!!!! cosmo decor is the best", rating: 5, date: "2025-09-11 11:57:22 UTC", reviewer: "salar", email: "fatima9253@gmail.com", handle: "3-5-ft-artificial-plant-in-irregular-diamond-pot-modern-home-decor-planter", pictures: "" },
    // Skipped one without handle in source? Or mapped manually? The 4th one has empty handle in source text provided by user.
    // I will stick to rows that HAS a handle or try to infer.
    { title: "", body: "good quality", rating: 5, date: "2025-09-11 11:58:48 UTC", reviewer: "Ahmad", email: "nadiaajmal11@icloud.com", handle: "4-5-ft-artificial-money-plant-in-black-grp-non-breakable-planter", pictures: "" },
    { title: "", body: "Fast delivery\nAnd amazing quality", rating: 5, date: "2025-09-11 16:14:57 UTC", reviewer: "Ishaajmal", email: "ishaajmal430@gmail.com", handle: "abstract-human-figurine-sculptures-modern-art-resin-decor-for-home-office", pictures: "" },
    { title: "", body: "I'm absolutely thrilled with Cosmodecor! As someone who's always on the lookout for unique and stylish home decor and mirrors, I stumbled upon this page, and it's been a revelation. The variety of products is staggering, and the quality is top-notch.", rating: 5, date: "2025-09-12 09:45:08 UTC", reviewer: "Hamid khan", email: "hamidkhan465326@gmail.com", handle: "full-length-arch-mirror-with-iron-frame-stand-dome-design", pictures: "" },
    { title: "", body: "In short, Cosmodecor is a must-visit destination* for anyone looking to elevate their home's style and sophistication. I'm so grateful to have found this platform, and I look forward to exploring more of their offerings in the future! ðŸ˜Š\n\n*Highly recommended! ðŸ‘", rating: 5, date: "2025-09-12 09:49:20 UTC", reviewer: "Hameed", email: "hameedkarzai385@gmail.com", handle: "full-length-arch-mirror-with-iron-frame-stand-dome-design", pictures: "" },
    { title: "", body: "quality was so good , ðŸ¥¹ like i was literally questioning them that why is for 2500 ? it worths more than 2500 \nloved it", rating: 5, date: "2025-10-21 19:37:53 UTC", reviewer: "Fazal", email: "l33942603@gmail.com", handle: "17-leaf-planter-set", pictures: "" },
    { title: "", body: "worth the price , would rate it a 10 out of 10 product", rating: 5, date: "2025-10-21 19:40:34 UTC", reviewer: "Haideralirajput", email: "haideralirajputofficial@gmail.com", handle: "17-leaf-planter-set", pictures: "" },
    { title: "", body: "jesi dekhai thi wese he recv hue hai , will share pics too", rating: 4, date: "2025-10-21 19:42:29 UTC", reviewer: "Ishaa", email: "ishaajmal430@gmail.com", handle: "17-leaf-planter-set", pictures: "" },
    { title: "", body: "jesi dekhaye thi wese he meli \naj he mela parcel", rating: 4, date: "2025-10-21 19:43:14 UTC", reviewer: "Ishaajmal", email: "ishaajmal430@gmail.com", handle: "17-leaf-planter-set", pictures: "" },
    { title: "", body: "Quality is so good. Owner was so cooperative and delivered the way its ordered. Highly recommended.", rating: 5, date: "2025-10-24 07:17:24 UTC", reviewer: "Hadiqa", email: "hadiqashahroom641@gmail.com", handle: "blob-mirror-4-x-2-ft-irregular-shaped-wall-mirror-for-modern-home-decor", pictures: "" },
    { title: "", body: "This plant made the corner of my lounge so beautiful. Quality is amazing and the owner was so cooperative and responsive. Will shop again.", rating: 5, date: "2025-10-24 07:20:06 UTC", reviewer: "Hadiqa", email: "hadiqashahroom641@gmail.com", handle: "6ft-artificial-monstera-deliciosa-plant-with-black-gold-ceramic-planter-tall-indoor-decorative-plant", pictures: "" },
    { title: "", body: "I received my parcel ðŸ“¦ top notch quality carefully packed and I literally loved the plant and the price is so reasonable ðŸ˜ will shop again Insha'Allah", rating: 5, date: "2025-10-24 07:23:09 UTC", reviewer: "Bisma", email: "aroojbisma37@gmail.com", handle: "17-leaf-planter-set", pictures: "https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1761290589__1000662665__original.jpg" },
    { title: "", body: "Looks super realistic and adds a touch of greenery to my space ðŸŒ¿ðŸ‘", rating: 5, date: "2025-10-24 13:27:31 UTC", reviewer: "Aaiza", email: "aaiza.mehmoods21@gmail.com", handle: "5-ft-artificial-banana-plant-with-8-leaves-in-non-breakable-grp-pot-pvc-rubber-indoor-outdoor-decor", pictures: "" },
    { title: "", body: "Love this lamp! Looks modern and perfect for adding ambiance!", rating: 5, date: "2025-10-24 13:31:03 UTC", reviewer: "Aaiza", email: "aaiza.mehmoods21@gmail.com", handle: "modern-touch-sensor-led-table-lamp-dimmable-rechargeable-bedside-lamp-for-home-decor", pictures: "" },
    { title: "", body: "Amazing quality plus the price omg..totally satisfied will surely shop again", rating: 5, date: "2025-10-24 14:23:45 UTC", reviewer: "Alisha", email: "alisha.khalils21@gmail.com", handle: "17-leaf-planter-set", pictures: "" },
    { title: "", body: "mam \nHope you are doing well. \nJust received my parsel. ðŸ’¯% Satisfied. Good quality, quick delivery, fast services.\nKeep it up and best of luckðŸŒ¸ðŸŒ¹â¤ï¸", rating: 5, date: "2025-11-01 16:34:00 UTC", reviewer: "Malaikaajmal", email: "malaikaajmal61@gmail.com", handle: "17-leaf-planter-set", pictures: "https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1762014841__1451e55b-ad5a-43c0-a721-baeb014b5cb3__original.jpeg" },
    { title: "", body: "Sorry I'm giving late review.. Actually my weekend was soo busy , the planter I ordered from you(cosmodecor) is amazing this decorative planter adds a beautiful touch to my space.\n will shop again from cosmodecor insha Allah", rating: 5, date: "2025-11-05 15:26:49 UTC", reviewer: "Fatima Zeesahan", email: "fatimaajmal9256@gmail.com", handle: "17-leaf-planter-set", pictures: "" },
    { title: "", body: "I received my order and I m very happy with the quality and packaging. \nThe item looks even better in person and fits beautifully with my home decor. \nThank you COSMODECORPK for the excellent service and quick delivery â¤ï¸", rating: 5, date: "2025-11-07 11:24:47 UTC", reviewer: "zuhra", email: "malaikaajmal61@gmail.com", handle: "elegant-ceramic-bowl-flower-arrangement-with-metal-stand", pictures: "" },
    { title: "", body: "Asslam o alikum kesi hai app mujy parcel receive ho gya hai or Boht acha hai mujy Pasand aya once again thank you so much â¤ï¸", rating: 5, date: "2025-11-07 11:28:21 UTC", reviewer: "Arsalan ashiq", email: "malaikaajmal61@gmail.com", handle: "elegant-ceramic-bowl-flower-arrangement-with-metal-stand", pictures: "https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1762514901__64c0582d-2cff-4c74-98b0-43ba734f3f3b__original.jpeg" },
    { title: "", body: "it's beautiful", rating: 5, date: "2025-11-07 11:30:52 UTC", reviewer: "Asad arain", email: "malaikaajmal61@gmail.com", handle: "decorative-artificial-flower-arrangement-in-round-pink-ceramic-pot-home-office-decor", pictures: "https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1762515052__874d02a7-ebff-4985-9587-fcd32a292cde__original.jpeg" },
    { title: "", body: "Loved it", rating: 5, date: "2025-11-14 11:41:41 UTC", reviewer: "Aleza kaashi", email: "malaikaajmal61@gmail.com", handle: "17-leaf-planter-set", pictures: "https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1763120502__983d811d-4a08-40fc-ac41-f2ea74bc6778__original.jpeg" },
    { title: "", body: "Lovely", rating: 5, date: "2025-11-14 11:45:55 UTC", reviewer: "Fatima", email: "malaikaajmal61@gmail.com", handle: "17-leaf-planter-set", pictures: "https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1763120756__img_8772__original.png" },
    { title: "", body: "What a lovely plants amazing ðŸ˜", rating: 5, date: "2025-11-19 15:14:41 UTC", reviewer: "Wamar", email: "malaikaajmal61@gmail.com", handle: "17-leaf-planter-set", pictures: "https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1763565281__ac058fec-3caf-427b-8078-3ce5097bc6a0__original.jpeg" },
    { title: "", body: "Loved the finishing", rating: 5, date: "2025-11-19 15:16:02 UTC", reviewer: "Salina", email: "malaikaajmal61@gmail.com", handle: "matte-donut-vase-8-inch-with-premium-floral-filling", pictures: "https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1763565362__img_8958__original.png" },
    { title: "", body: "Best best best", rating: 5, date: "2025-12-05 13:35:30 UTC", reviewer: "Ridaa Fatima", email: "ridaa.fatima34@gmail.com", handle: "tall-black-gold-floor-vase-with-artificial-green-arrangement", pictures: "https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1764941761__1764941758757-7a4cd515-3c33-4aa9-b208-05__original.jpeg" },
    { title: "", body: "Cute", rating: 5, date: "2025-12-30 15:14:16 UTC", reviewer: "Anabia", email: "malaikaajmal61@gmail.com", handle: "elegant-ceramic-bowl-flower-arrangement-with-metal-stand", pictures: "https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1767107656__479fbc88-e7a5-4ed9-ad7d-a182f19cf688__original.jpeg" },
    { title: "", body: "Can I get in white color", rating: 3, date: "2025-12-31 01:02:36 UTC", reviewer: "Rafaqat", email: "rafaqat.ncba@gmail.com", handle: "artificial-blossom-tree-4-75-ft-cherry-blossom-floor-plant-for-home-event-decor", pictures: "https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1767142956__screenshot_20251231-055517__original.jpg" },
    { title: "", body: "Lovely", rating: 5, date: "2026-01-28 14:00:12 UTC", reviewer: "Salina", email: "malaikaajmal61@gmail.com", handle: "17-leaf-money-plant-3-ft-height", pictures: "https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1769608812__e71698d1-b54a-4f19-8b6d-18ff313253e7__original.jpeg" },
    { title: "", body: "as expected", rating: 5, date: "2026-01-30 13:07:54 UTC", reviewer: "ashahna", email: "ishaajmal430@gmail.com", handle: "17-leaf-money-plant-3-ft-height", pictures: "https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1769778475__1000441187__original.jpg" },
    { title: "", body: "price zayada honi chia quality k hisab sa best deal", rating: 5, date: "2026-01-30 13:08:49 UTC", reviewer: "anaya", email: "ishaajmal430@gmail.com", handle: "17-leaf-money-plant-3-ft-height", pictures: "https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1769778529__1000441188__original.jpg" },
    { title: "", body: "plantar ki quality boht achi hai", rating: 5, date: "2026-01-30 13:10:09 UTC", reviewer: "Salina", email: "malaikaajmal61@gmail.com", handle: "17-leaf-planter-set", pictures: "https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1769778609__1000441188__original.jpg" },
    { title: "", body: "Beautiful", rating: 5, date: "2026-01-30 13:10:49 UTC", reviewer: "Salina", email: "malaikaajmal61@gmail.com", handle: "17-leaf-planter-set", pictures: "https://s3.amazonaws.com/me.judge.review-images/cosmo-decorpk/1769778649__1000441187__original.jpg" }
];

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

async function run() {
    try {
        console.log("🚀 Starting Reviews Import...");

        // 1. Setup Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                reviewer_name VARCHAR(100),
                reviewer_email VARCHAR(100),
                review_date TIMESTAMP DEFAULT NOW(),
                picture_urls TEXT[],
                verified_purchase BOOLEAN DEFAULT true,
                status VARCHAR(20) DEFAULT 'approved',
                created_at TIMESTAMP DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
        `);
        console.log("✅ Reviews Table Configured.");

        // 2. Clear Automated Reviews
        const del = await pool.query("DELETE FROM reviews WHERE status = 'automated' OR verified_purchase = false");
        console.log(`🗑️ Deleted ${del.rowCount} automated/unverified reviews.`);

        // 3. Load Products & Generate Slugs
        const prodRes = await pool.query("SELECT id, name FROM products");
        const productMap = {};

        prodRes.rows.forEach(p => {
            const slug = slugify(p.name);
            productMap[slug] = p.id;
        });

        console.log(`📦 Loaded ${prodRes.rows.length} products to map.`);

        // 4. Import Reviews
        let imported = 0;
        let skipped = 0;

        for (const review of REVIEWS_DATA) {
            if (!review.handle) {
                skipped++;
                continue;
            }

            const productId = productMap[review.handle] ||
                productMap[review.handle.replace(/-and-/g, '-&-')]; // Try variations if simple mismatch

            if (!productId) {
                // Fuzzy check or loose check?
                // Try searching the map keys for containment
                let foundId = null;
                for (const [slug, id] of Object.entries(productMap)) {
                    if (slug === review.handle || slug.includes(review.handle) || review.handle.includes(slug)) {
                        foundId = id;
                        break;
                    }
                }

                if (foundId) {
                    await insertReview(foundId, review);
                    imported++;
                } else {
                    console.warn(`⚠️ Skipped: No matching product for '${review.handle}'`);
                    skipped++;
                }
            } else {
                await insertReview(productId, review);
                imported++;
            }
        }

        console.log(`✅ Imported: ${imported}, Skipped: ${skipped}`);

        // 5. Update Product Ratings
        console.log("🔄 Recalculating Product Ratings...");
        await pool.query(`
            UPDATE products p
            SET 
                rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews r WHERE r.product_id = p.id),
                reviews = (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id)
            WHERE id IN (SELECT DISTINCT product_id FROM reviews)
        `);
        console.log("🌟 Ratings Updated!");

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        pool.end();
    }
}

async function insertReview(productId, review) {
    const pictures = review.pictures ? [review.pictures] : [];
    await pool.query(`
        INSERT INTO reviews (product_id, rating, comment, reviewer_name, reviewer_email, review_date, picture_urls, verified_purchase, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'approved')
    `, [
        productId,
        review.rating,
        review.body,
        review.reviewer || 'Anonymous',
        review.email || '',
        review.date,
        pictures,
        true
    ]);
}

run();
