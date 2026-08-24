import fs from 'fs';
import crypto from 'node:crypto';
import path from 'path';

import { toHtml } from 'hast-util-to-html';
import { h } from 'hastscript';
import { toHast } from 'mdast-util-to-hast';

import { semanticColors } from '$lib/theme/io/semantic-colors';
import { process } from '$lib/utilities/render-markdown';

type RenderOptions = {
  host: string;
  nonce: string;
  theme?: string;
  overrideTheme?: string;
};

type ThemeMode = 'light' | 'dark';

const markdownColorVariables = (mode: ThemeMode) => ({
  '--color-background-primary': semanticColors.background.primary[mode],
  '--color-content-brand': semanticColors.content.brand[mode],
  '--color-content-primary': semanticColors.content.primary[mode],
  '--color-border-brand': semanticColors.border.brand[mode],
  '--color-border-secondary': semanticColors.border.secondary[mode],
  '--color-surface-brand': semanticColors.surface.brand[mode],
  '--color-surface-primary': semanticColors.surface.primary[mode],
});

const markdownColorRule = (selector: string, mode: ThemeMode): string => {
  const declarations = Object.entries(markdownColorVariables(mode))
    .map(([name, value]) => `${name}: ${value};`)
    .join('\n');

  return `${selector} {\n${declarations}\n}`;
};

const markdownThemeCss = [
  markdownColorRule(':root', 'light'),
  markdownColorRule("body[data-theme^='dark']", 'dark'),
].join('\n');

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

/**
 * Create a new HTML page with the given AST.
 */
const createPage = (
  ast: ReturnType<typeof toHast>,
  { nonce, theme, overrideTheme }: RenderOptions,
) => {
  const cssPath = path.resolve('src/markdown.reset.css');
  const css = `${markdownThemeCss}\n${fs.readFileSync(cssPath, 'utf8')}`;
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
  const html = createPage(await process(content), {
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
