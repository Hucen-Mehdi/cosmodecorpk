import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly
dotenv.config({ path: path.join(process.cwd(), '.env') });

export const JWT_SECRET = process.env.JWT_SECRET || 'cosmodecor_secret_key_123';
export const PORT = Number(process.env.PORT) || 5000;
export const DATABASE_URL = process.env.DATABASE_URL;

console.log(`🔐 Config Loaded: JWT_SECRET=${JWT_SECRET === 'cosmodecor_secret_key_123' ? 'Default' : 'Custom'}, DB=${DATABASE_URL ? 'Set' : 'Missing'}`);
