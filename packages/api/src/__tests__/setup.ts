import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from root .env
config({ path: resolve(__dirname, '../../../../.env') });

// Verify required env vars are present
const requiredEnvVars = ['FM_SERVER', 'FM_DATABASE', 'OTTO_API_KEY'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Warning: Missing environment variable ${envVar}`);
  }
}

