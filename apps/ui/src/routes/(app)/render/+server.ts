import crypto from 'node:crypto';

import { toHtml } from 'hast-util-to-html';
import { h } from 'hastscript';
import { toHast } from 'mdast-util-to-hast';

import { markdownStylesheet } from '$lib/utilities/markdown-stylesheet';
import { process } from '$lib/utilities/render-markdown';

type RenderOptions = {
  compact?: boolean;
  inline?: boolean;
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
  const sandbox = [
    'sandbox',
    'allow-same-origin',
    'allow-popups',
    'allow-popups-to-escape-sandbox',
  ]
    .filter(Boolean)
    .join(' ');

  return `base-uri 'self'; default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}'; frame-ancestors 'self'; form-action 'none'; ${sandbox};`;
};

const bodyClass = ({
  compact,
  inline,
}: Pick<RenderOptions, 'compact' | 'inline'>) => {
  const classes = ['prose'];
  if (compact || inline) classes.push('compact');
  if (inline) classes.push('inline');

  return classes.join(' ');
};

/**
 * Create a new HTML page with the given AST.
 */
const createPage = (
  ast: ReturnType<typeof toHast>,
  { compact, inline, nonce, theme, overrideTheme }: RenderOptions,
) => {
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
        h('style', { nonce }, markdownStylesheet),
      ]),
      h(
        'body',
        {
          class: bodyClass({ compact, inline }),
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
  const compact = url.searchParams.get('compact') === 'true';
  const inline = url.searchParams.get('inline') === 'true';

  if (host === null) return new Response('Not found', { status: 404 });
  if (content === null) return new Response('Not found', { status: 404 });

  const nonce = generateNonce();
  const html = createPage(await process(content), {
    compact,
    inline,
    nonce,
    host,
    theme,
    overrideTheme,
  });

  const response = new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Security-Policy': generateContentSecurityPolicy({
        nonce,
        host,
        overrideTheme,
      }),
    },
  });

  return response;
};
