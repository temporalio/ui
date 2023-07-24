import type { Plugin } from 'vite';

import { generateLocales } from '../src/lib/i18n/generate-locales';

type PluginOptions = {
  src: string;
  dest: string;
};

export function i18nPlugin(options: PluginOptions): Plugin {
  const { src, dest } = options;

  return {
    name: 'vite-plugin-i18n-generate-locales',
    async buildStart() {
      await generateLocales(src, dest, 'ts');
    },
    async handleHotUpdate(ctx) {
      if (ctx.file.match(/src\/lib\/i18n\/locales\/\w+\/\w+\.ts/) !== null) {
        await generateLocales(src, dest, 'ts');
      }
    },
  };
}
