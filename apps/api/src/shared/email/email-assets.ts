import { readFileSync } from 'node:fs';

// PNG exports of the approved apps/web/public/assets SVGs; opaque logo backplates preserve fallback contrast.
export const emailBrandAttachments = [
  ['perigee-primary-light.png', 'perigee-logo-light'],
  ['perigee-primary-dark.png', 'perigee-logo-dark'],
  ['brand-logo.png', 'perigee-brandmark'],
].map(([filename, cid]) => ({
  filename,
  cid,
  content: readFileSync(
    new URL(`../../../src/shared/email/templates/assets/${filename}`, import.meta.url),
  ),
  contentType: 'image/png',
  contentDisposition: 'inline' as const,
}));
