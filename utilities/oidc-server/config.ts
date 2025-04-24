import path from 'node:path';

import { dirname } from 'desm';

const __dirname = dirname(import.meta.url);

/**
 * Port on which the OIDC server listens (default: 8889)
 */
export const PORT: number = Number(process.env.OIDC_PORT) || 8889;

/**
 * Issuer URL for OIDC provider (default: http://localhost:<PORT>)
 */
export const ISSUER: string =
  process.env.OIDC_ISSUER || `http://localhost:${PORT}`;

/**
 * Path to EJS views directory
 */
export const VIEWS_PATH: string = path.join(__dirname, 'views');
