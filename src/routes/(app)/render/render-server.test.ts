import { describe, expect, it } from 'vitest';

import { GET } from './+server';

const render = async (content: string, inline = false) => {
  const url = new URL('http://localhost/render');
  url.searchParams.set('content', content);
  url.searchParams.set('inline', String(inline));
  url.searchParams.set('theme', 'light');

  const response = await GET(new Request(url));
  const html = await response.text();
  return new DOMParser().parseFromString(html, 'text/html');
};

describe('markdown render route', () => {
  it('renders single-line Markdown links in inline mode', async () => {
    const document = await render(
      '[Logging System](https://temporal.io/blog)',
      true,
    );

    expect(document.body.classList.contains('inline-mode')).toBe(true);
    expect(document.querySelector('a')?.href).toBe('https://temporal.io/blog');
    expect(document.querySelector('a')?.textContent).toBe('Logging System');
  });

  it('keeps the existing block renderer as the default', async () => {
    const document = await render('Logging System');

    expect(document.body.classList.contains('inline-mode')).toBe(false);
    expect(document.querySelector('main')?.textContent).toBe('Logging System');
  });
});
