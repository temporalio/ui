import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { defaultPalette } from '$lib/theme/palettes';

const appTemplate = readFileSync(
  resolve(process.cwd(), 'src/app.html'),
  'utf8',
);
const svelteConfig = readFileSync(
  resolve(process.cwd(), 'svelte.config.js'),
  'utf8',
);
const prepaintScript = appTemplate.match(
  /<script data-prepaint>([\s\S]*?)<\/script>/,
)?.[1];

const runPrepaint = () => {
  if (!prepaintScript) throw new Error('Pre-paint script is missing');
  window.eval(prepaintScript);
};

describe('pre-paint theme and visual version', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, '', '/');
    document.documentElement.dataset.theme = 'light';
    delete document.documentElement.dataset.palette;
    document.documentElement.dataset.paletteDefault = 'precision';
    document.documentElement.dataset.visualVersion = 'v2';
    document.documentElement.dataset.visualDefault = '';
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(
        (query) =>
          ({
            matches: false,
            media: query,
          }) as MediaQueryList,
      ),
      writable: true,
    });
  });

  it('keeps the manual script covered by CSP before static content runs', () => {
    expect(prepaintScript).toBeTruthy();

    const hash = `sha256-${createHash('sha256')
      .update(prepaintScript ?? '')
      .digest('base64')}`;

    expect(svelteConfig).toContain(`'${hash}'`);
    expect(appTemplate.indexOf('%sveltekit.head%')).toBeLessThan(
      appTemplate.indexOf('<script data-prepaint>'),
    );
    expect(appTemplate).not.toContain('%sveltekit.nonce%');
    expect(appTemplate).toContain(`data-palette-default="${defaultPalette}"`);
  });

  it('applies query, storage, and build defaults in rollback order', () => {
    document.documentElement.dataset.visualDefault = 'legacy';
    runPrepaint();
    expect(document.documentElement.dataset.visualVersion).toBe('legacy');

    window.localStorage.setItem('visual version', 'v2');
    runPrepaint();
    expect(document.documentElement.dataset.visualVersion).toBe('v2');

    window.history.replaceState({}, '', '/?visual=legacy');
    runPrepaint();
    expect(document.documentElement.dataset.visualVersion).toBe('legacy');
  });

  it('applies persisted and system themes before app startup', () => {
    window.localStorage.setItem('dark mode', 'true');
    runPrepaint();
    expect(document.documentElement.dataset.theme).toBe('dark');

    window.localStorage.setItem('dark mode', 'false');
    runPrepaint();
    expect(document.documentElement.dataset.theme).toBe('light');

    window.localStorage.setItem('dark mode', '"system"');
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
    } as MediaQueryList);
    runPrepaint();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('applies a safe persisted palette slug before app startup', () => {
    window.localStorage.setItem('color palette', '"future-palette"');

    runPrepaint();

    expect(document.documentElement.dataset.palette).toBe('future-palette');
  });

  it('uses the configured default palette for missing or unsafe preferences', () => {
    runPrepaint();
    expect(document.documentElement.dataset.palette).toBe('precision');

    window.localStorage.setItem('color palette', '"../../unsafe"');
    runPrepaint();
    expect(document.documentElement.dataset.palette).toBe('precision');
  });
});
