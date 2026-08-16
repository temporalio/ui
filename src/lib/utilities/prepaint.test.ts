import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

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
});
