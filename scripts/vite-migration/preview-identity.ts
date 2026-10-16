import { buildIdentityForIndexFile } from './evidence-run';

const indexPath = process.argv[2];
if (!indexPath) {
  throw new Error('Usage: preview-identity.ts <archived-index.html>');
}

process.stdout.write(`${await buildIdentityForIndexFile(indexPath)}\n`);
