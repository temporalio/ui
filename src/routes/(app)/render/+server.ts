import fs from 'fs';
import crypto from 'node:crypto';
import path from 'path';

import { toHtml } from 'hast-util-to-html';
import { h } from 'hastscript';
import { toHast } from 'mdast-util-to-hast';

import { process } from '$lib/utilities/render-markdown';

type RenderOptions = {
  host: string;
  nonce: string;
  theme?: string;
  overrideTheme?: string;
};

/**
 * Generate a random nonce.
 */
const generateNonce = (): string => crypto.randomBytes(16).toString('hex');

/**
 * Generate a Content Security Policy header value.
 * @param nonce
 * @returns
 */
const generateContentSecurityPolicy = ({ nonce }: RenderOptions) => {
  return `base-uri 'self'; default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}'; frame-ancestors 'self'; form-action 'none'; sandbox allow-same-origin allow-popups allow-popups-to-escape-sandbox;`;
};

/**
 * Create a new HTML page with the given AST.
 */
const createPage = (
  ast: ReturnType<typeof toHast>,
  { nonce, theme, overrideTheme }: RenderOptions,
) => {
  const cssPath = path.resolve('src/markdown.reset.css');
  const css = fs.readFileSync(cssPath, 'utf8');
  return toHtml(
    h('html', [
      h('head', [
        h('title', 'Rendered Markdown'),
        h('base', { target: '_blank' }),
        h('meta', { charset: 'utf-8' }),
        h('meta', {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        }),
        h('style', { nonce }, css),
      ]),
      h(
        'body',
        {
          class: 'prose',
          'data-theme': overrideTheme ? `${theme}-${overrideTheme}` : theme,
        },
        h('main', ast),
      ),
    ]),
  );
};

export const GET = async (req: Request) => {
  const url = new URL(req.url);

  const host = url.origin;
  const content = url.searchParams.get('content') || '';
  const theme = url.searchParams.get('theme') || '';
  const overrideTheme = url.searchParams.get('overrideTheme') || '';

  if (host === null) return new Response('Not found', { status: 404 });
  if (content === null) return new Response('Not found', { status: 404 });

  const nonce = generateNonce();

  const response = new Response(
    createPage(await process(content), { nonce, host, theme, overrideTheme }),
    {
      headers: {
        'Content-Type': 'text/html',
        'Content-Security-Policy': generateContentSecurityPolicy({
          nonce,
          host,
          overrideTheme,
        }),
      },
    },
  );

  return response;
};
