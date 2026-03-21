// backend/loadEnv.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Assuming .env file is in the same directory as this file (the backend directory)
const envPath = path.resolve(__dirname, '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('[loadEnv.js] Error loading .env file:', result.error);
} else {
  console.log(`[loadEnv.js] Successfully loaded .env from: ${envPath}`);
  // It's good practice not to log all parsed variables in production, but for debugging:
  // console.log('[loadEnv.js] Parsed .env variables by dotenv:', result.parsed);
}
// Log the specific variable we're interested in, after attempting to load
console.log('[loadEnv.js] GOOGLE_CLIENT_ID after dotenv.config in loadEnv.js:', process.env.GOOGLE_CLIENT_ID);
