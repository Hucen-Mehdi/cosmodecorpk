# 🗄️ Database Management Guide

To prevent data loss and schema discrepancies, follow these rules:

## 1. Schema Changes
Whenever you add a new column or table:
1. Create a new `.sql` file in `server/migrations/` (e.g., `009_your_change.sql`).
2. Run `npm run db:migrate` to apply it.
3. The system now tracks executed migrations in the `_migrations_tracking` table, so it will **never run the same script twice**.

## 2. Seeding / Restoring Data
If you need to reset your database or sync with the latest "Real" data:
*   Run `npm run db:seed`.
*   This script now reads from `database_backup.sql`, which is our **Production Truth**. It includes all products, categories, reviews, and testimonials with your custom admin edits.

## 3. Backing Up Edits
If you make a lot of changes in the Admin Panel and want to save them as the new "Default":
*   Run a PostgreSQL dump command:
    `pg_dump -U postgres -d cosmodecorpk > database_backup.sql`
*   This updates the source file that `npm run db:seed` uses.

## 4. Environment Safety
The scripts are environment-aware. They will use the `DATABASE_URL` from your `.env` file if it exists, otherwise they fallback to local defaults.
