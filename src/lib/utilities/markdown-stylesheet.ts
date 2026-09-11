// Relative rather than $lib: scripts/generate-markdown-css.ts pulls this
// module in through esno, which does not resolve SvelteKit aliases.
import {
  type IoTheme,
  ioThemeToCssVariables,
  themes,
} from '../theme/io/themes';

const { dark: darkTheme, light: lightTheme } = themes;

/**
 * The render route paints markdown inside a sandboxed frame that inherits no
 * styles from the page, so the handful of theme colours the reset refers to
 * have to travel with it.
 */
const markdownColorVariableNames = new Set([
  '--color-background-primary',
  '--color-content-brand',
  '--color-content-primary',
  '--color-border-brand',
  '--color-border-secondary',
  '--color-surface-primary',
  '--color-surface-secondary',
]);

const markdownColorVariables = (theme: IoTheme) =>
  Object.fromEntries(
    Object.entries(ioThemeToCssVariables(theme)).filter(([name]) =>
      markdownColorVariableNames.has(name),
    ),
  );

const markdownColorRule = (selector: string, theme: IoTheme): string => {
  const declarations = Object.entries(markdownColorVariables(theme))
    .map(([name, value]) => `${name}: ${value};`)
    .join('\n');

  return `${selector} {\n${declarations}\n}`;
};

export const markdownThemeCss = [
  markdownColorRule(':root', lightTheme),
  markdownColorRule("body[data-theme^='dark']", darkTheme),
].join('\n');

/**
 * The complete stylesheet for a rendered markdown frame.
 *
 * Kept pure and given the reset as an argument so the two things that need
 * this stylesheet can both call it: the SvelteKit route, which imports the
 * reset at build time, and scripts/generate-markdown-css.ts, which reads it
 * from disk to produce the copy the Go render route embeds. Neither composes
 * the stylesheet itself, so the two cannot disagree.
 */
export const composeMarkdownStylesheet = (reset: string): string =>
  `${markdownThemeCss}\n${reset}`;
