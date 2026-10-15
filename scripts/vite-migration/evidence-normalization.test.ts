import { describe, expect, it } from 'vitest';

import {
  normalizeEvidenceText,
  normalizeEvidenceUrl,
  normalizeSemanticText,
} from './evidence-normalization';

const origins = ['http://127.0.0.1:4173', 'http://127.0.0.1:4174'];

describe('migration evidence normalization', () => {
  it('normalizes only configured application origins in URLs', () => {
    expect(
      normalizeEvidenceUrl(
        'http://127.0.0.1:4173/assets/app-abCDef123.js?from=https://example.com',
        origins,
      ),
    ).toBe('<app-origin>/assets/app-<hash>.js?from=https://example.com');
  });

  it('preserves warning and error content while normalizing app locations', () => {
    expect(
      normalizeEvidenceText(
        'Warning at http://127.0.0.1:4174/assets/chunk-a1B2c3D4.js:10:2',
        origins,
      ),
    ).toBe('Warning at <app-origin>/assets/chunk-<hash>.js:10:2');
  });

  it('normalizes generated SvelteKit chunk, entry, and node hashes', () => {
    expect(
      normalizeEvidenceText(
        [
          'http://127.0.0.1:4173/_app/immutable/chunks/BKJWrPw2.js',
          'http://127.0.0.1:4173/_app/immutable/entry/start._fS0jhp1.js',
          'http://127.0.0.1:4173/_app/immutable/nodes/1.IT_TKIz9.js',
        ].join('\n'),
        origins,
      ),
    ).toBe(
      [
        '<app-origin>/_app/immutable/chunks/<hash>.js',
        '<app-origin>/_app/immutable/entry/start.<hash>.js',
        '<app-origin>/_app/immutable/nodes/1.<hash>.js',
      ].join('\n'),
    );
  });

  it('normalizes semantic whitespace without changing words', () => {
    expect(normalizeSemanticText('  Start\t Workflow \r\n\r\n Details  ')).toBe(
      'Start Workflow\nDetails',
    );
  });
});
