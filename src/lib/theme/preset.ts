import type { Config } from 'tailwindcss';

import temporal, { textStyles } from './plugin';

/**
 * Scales Tailwind does not ship. These belong to the preset rather than to this
 * repo's own config, because a consumer building against the preset generates
 * the utilities for the components it imports: a token defined only here would
 * leave `text-2xs` with no rule in their build, and the element inheriting
 * whatever size its parent had.
 */
export const fontSize = {
  '2xs': '0.625rem',
} as const;

const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontSize,
    },
  },
  plugins: [temporal, textStyles],
} satisfies Config;

export default config;
