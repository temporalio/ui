import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  buildGeneratedStylesheet,
  GENERATED_PATH,
} from './generate-markdown-css';

describe('generate-markdown-css', () => {
  // The Go render route embeds the checked-in file, so a stale copy means a
  // packaged ui-server serves different CSS than the SvelteKit route does.
  // This is what makes the two genuinely share one source: an edit to the
  // reset, or a change to an Io theme colour, fails here until regenerated.
  it('keeps the checked-in stylesheet current', () => {
    expect(readFileSync(GENERATED_PATH, 'utf8')).toBe(
      buildGeneratedStylesheet(),
    );
  });

  it('carries the Io theme colours the reset refers to', () => {
    const generated = buildGeneratedStylesheet();

    // Every var() the reset uses must resolve, or the frame renders unstyled
    // text. This is the drift that left the Go route on the pre-Io palette.
    const referenced = [
      ...readFileSync(GENERATED_PATH, 'utf8').matchAll(
        /var\((--color-[a-z-]+)\)/g,
      ),
    ].map(([, name]) => name);

    expect(referenced.length).toBeGreaterThan(0);
    for (const name of new Set(referenced)) {
      expect(generated, `${name} is used but never defined`).toContain(
        `${name}:`,
      );
    }
  });
});
