import { describe, expect, it } from 'vitest';

import { GET } from './+server';

const render = async (params: Record<string, string>) => {
  const query = new URLSearchParams(params).toString();
  const response = await GET(new Request(`http://localhost/render?${query}`));

  return { response, html: await response.text() };
};

describe('/render', () => {
  it('serves markdown under a locked-down policy', async () => {
    const { response } = await render({ content: 'hello' });
    const policy = response.headers.get('Content-Security-Policy') ?? '';

    expect(response.headers.get('Content-Type')).toBe('text/html');
    expect(policy).toContain("default-src 'none'");
    expect(policy).toContain('sandbox');
  });

  it('renders block markdown as blocks by default', async () => {
    const { html } = await render({ content: '# Orders' });

    expect(html).toContain('<h1>Orders</h1>');
    expect(html).toContain('class="prose"');
  });

  it('flows the content in compact mode', async () => {
    const { html } = await render({ content: 'hello', compact: 'true' });

    expect(html).toContain('class="prose compact"');
    expect(html).toContain('body.compact');
  });

  it('leaves compact mode opt-in', async () => {
    const { html } = await render({ content: 'hello', compact: 'false' });

    expect(html).toContain('class="prose"');
    expect(html).not.toContain('class="prose compact"');
  });

  it('keeps wrapping on in compact mode, so longer content still fits', async () => {
    const { html } = await render({ content: 'hello', compact: 'true' });

    expect(html).toMatch(/body\.compact\s*\{[^}]*white-space:\s*normal/);
  });

  it('still strips what the renderer strips, in either mode', async () => {
    for (const compact of ['true', 'false']) {
      const { html } = await render({
        content: '![x](https://evil.example/p.gif) <script>alert(1)</script>',
        compact,
      });

      expect(html).not.toContain('<img');
      expect(html).not.toContain('<script>alert(1)</script>');
    }
  });
});
