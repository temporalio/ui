import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Decorator, Preview } from '@storybook/sveltekit';
import '../src/app.css';
import i18next from 'i18next';

import { redesignViewports } from './visual-modes';
import { i18nNamespaces } from '../src/lib/i18n';
import resources from '../src/lib/i18n/locales';
import {
  defaultPalette,
  isPaletteName,
  paletteNames,
} from '../src/lib/theme/palettes';

i18next.init({
  fallbackLng: 'en',
  load: 'languageOnly',
  ns: i18nNamespaces,
  defaultNS: 'common',
  detection: {
    order: ['querystring', 'localStorage', 'navigator'],
    caches: ['localStorage'],
    lookupQuerystring: 'lng',
    lookupLocalStorage: 'locale',
  },
  resources,
});

const paletteTitle = (palette: string) =>
  `${palette.charAt(0).toUpperCase()}${palette.slice(1)}`;

const withPalette: Decorator = (Story, context) => {
  const palette = isPaletteName(context.globals.palette)
    ? context.globals.palette
    : defaultPalette;

  document.documentElement.dataset.palette = palette;
  document.body.dataset.palette = palette;

  return Story();
};

const preview: Preview = {
  decorators: [
    withPalette,
    withThemeByDataAttribute({
      defaultTheme: 'light',
      themes: {
        light: 'light',
        dark: 'dark',
      },
      attributeName: 'data-theme',
    }),
  ],
  globalTypes: {
    palette: {
      description: 'Semantic color palette',
      toolbar: {
        dynamicTitle: true,
        icon: 'paintbrush',
        items: paletteNames.map((palette) => ({
          title: paletteTitle(palette),
          value: palette,
        })),
      },
    },
  },
  initialGlobals: {
    palette: defaultPalette,
  },
  parameters: {
    backgrounds: {
      disable: true,
    },
    controls: {
      exclude: /^id|name|class|data-\w+|on\w+/,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    chromatic: {
      pauseAnimationAtEnd: true,
      prefersReducedMotion: 'reduce',
    },
    viewport: {
      options: redesignViewports,
    },
  },
};

export default preview;
