import { describe, expect, it } from 'vitest';

import { process, render } from './render-markdown';

const toHtml = async (markdown: string) => render(await process(markdown));

describe('render-markdown', () => {
  describe('GFM tables', () => {
    const table = [
      '| Name | Status |',
      '| ---- | ------ |',
      '| foo  | Running |',
      '| bar  | Completed |',
    ].join('\n');

    it('renders a GFM table as an HTML table', async () => {
      const html = await toHtml(table);

      expect(html).toContain('<table>');
      expect(html).toContain('<thead>');
      expect(html).toContain('<tbody>');
      expect(html).toContain('<th>Name</th>');
      expect(html).toContain('<th>Status</th>');
      expect(html).toContain('<td>foo</td>');
      expect(html).toContain('<td>Completed</td>');
    });

    it('preserves column alignment', async () => {
      const aligned = [
        '| Left | Center | Right |',
        '| :--- | :----: | ----: |',
        '| a    | b      | c     |',
      ].join('\n');

      const html = await toHtml(aligned);

      expect(html).toContain('<th align="left">Left</th>');
      expect(html).toContain('<th align="center">Center</th>');
      expect(html).toContain('<th align="right">Right</th>');
    });

    it('renders inline markdown inside table cells', async () => {
      const withInline = [
        '| Field | Value |',
        '| ----- | ----- |',
        '| link  | [docs](https://temporal.io) |',
      ].join('\n');

      const html = await toHtml(withInline);

      expect(html).toContain('<td><a href="https://temporal.io">docs</a></td>');
    });
  });

  describe('regressions', () => {
    it('renders standard markdown', async () => {
      const html = await toHtml('# Heading\n\nSome **bold** text.');

      expect(html).toContain('<h1>Heading</h1>');
      expect(html).toContain('<strong>bold</strong>');
    });

    it('renders links', async () => {
      const html = await toHtml('[Temporal](https://temporal.io)');

      expect(html).toContain('<a href="https://temporal.io">Temporal</a>');
    });

    it('strips raw HTML, scripts, and images', async () => {
      const html = await toHtml(
        [
          'text',
          '<div>raw html</div>',
          '<script>alert("xss")</script>',
          '![alt](https://temporal.io/image.png)',
        ].join('\n\n'),
      );

      expect(html).not.toContain('<div>');
      expect(html).not.toContain('<script>');
      expect(html).not.toContain('<img');
    });

    it('does not render a pipe-delimited line as a table without a delimiter row', async () => {
      const html = await toHtml('a | b | c');

      expect(html).not.toContain('<table>');
    });
  });
});
