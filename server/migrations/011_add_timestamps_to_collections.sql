-- Migration 011: Add timestamps to collections
ALTER TABLE collections ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE collections ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
