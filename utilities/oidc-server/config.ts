import path from 'node:path';

import { dirname } from 'desm';

const __dirname = dirname(import.meta.url);

/**
 * Configuration for the OIDC server
 */
export function getConfig() {
  /**
   * Port on which the OIDC server listens (default: 8889)
   */
  const PORT: number = Number(process.env.OIDC_PORT) || 8889;

  /**
   * Issuer URL for OIDC provider (default: http://localhost:<PORT>)
   */
  const ISSUER: string = process.env.OIDC_ISSUER || `http://localhost:${PORT}`;

  /**
   * Path to EJS views directory
   */
  const VIEWS_PATH: string = path.join(__dirname, 'views');

  return {
    PORT,
    ISSUER,
    VIEWS_PATH,
  };
}
