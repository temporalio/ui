import fs from 'fs';
import crypto from 'node:crypto';
import path from 'path';

import { toHtml } from 'hast-util-to-html';
import { h } from 'hastscript';
import { toHast } from 'mdast-util-to-hast';

import {
  defaultPalette,
  isPaletteName,
  type PaletteName,
} from '$lib/theme/palettes';
import { paletteCSSVariables } from '$lib/theme/variables';
import { process } from '$lib/utilities/render-markdown';

type RenderOptions = {
  host: string;
  nonce: string;
  palette: PaletteName;
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
const generateContentSecurityPolicy = ({
  nonce,
}: Pick<RenderOptions, 'nonce'>) => {
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

const serializeCSSVariables = (variables: Record<string, string>): string =>
  Object.entries(variables)
    .map(([name, value]) => `${name}: ${value};`)
    .join('\n');

const createPaletteCSS = (palette: PaletteName): string => {
  const variables = paletteCSSVariables[palette];

  return `:root {
${serializeCSSVariables(variables.light)}
}

body[data-theme='dark'],
body[data-theme^='dark-'] {
${serializeCSSVariables(variables.dark)}
}`;
};

/**
 * Create a new HTML page with the given AST.
 */
const createPage = (
  ast: ReturnType<typeof toHast>,
  { nonce, palette, theme, overrideTheme }: RenderOptions,
) => {
  const cssPath = path.resolve('src/markdown.reset.css');
  const css = fs.readFileSync(cssPath, 'utf8');
  const paletteCSS = createPaletteCSS(palette);
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
        h('style', { nonce }, `${paletteCSS}\n${css}`),
      ]),
      h(
        'body',
        {
          class: 'prose',
          'data-palette': palette,
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
  const paletteParameter = url.searchParams.get('palette');
  const palette = isPaletteName(paletteParameter)
    ? paletteParameter
    : defaultPalette;

  if (host === null) return new Response('Not found', { status: 404 });
  if (content === null) return new Response('Not found', { status: 404 });

  const nonce = generateNonce();
  const html = createPage(await process(content), {
    nonce,
    host,
    palette,
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
