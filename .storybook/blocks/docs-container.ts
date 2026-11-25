import {
  DocsContainer,
  type DocsContainerProps,
} from '@storybook/addon-docs/blocks';
import {
  createElement as h,
  type PropsWithChildren,
  type ReactElement,
  useEffect,
  useState,
} from 'react';
import { GLOBALS_UPDATED } from 'storybook/internal/core-events';
import type { Globals } from 'storybook/internal/types';
import { create, type ThemeVars } from 'storybook/theming';

import { ioStoriesPrefix } from './component-docs';
import {
  defaultThemeName,
  type ThemeName,
  themes,
} from '../../src/lib/theme/io/themes';

// Storybook's docs chrome is themed separately from the stories it renders,
// so build a docs theme from each Io theme's tokens. Border tokens are
// color-mix() values, which Storybook's theming can't parse, so the base
// theme's border is kept.
const docsThemes = Object.fromEntries(
  Object.entries(themes).map(([name, { color }]) => [
    name,
    create({
      base: name === 'dark' ? 'dark' : 'light',
      appContentBg: color.background.primary,
      appPreviewBg: color.background.primary,
      textColor: color.content.primary,
      textMutedColor: color.content.secondary,
    }),
  ]),
) as Record<ThemeName, ThemeVars>;

const toThemeName = (globals?: Globals): ThemeName => {
  const theme = globals?.theme;
  return theme in themes ? theme : defaultThemeName;
};

const isIoPage = (context: DocsContainerProps['context']): boolean => {
  try {
    const fileName: unknown = context.resolveOf('meta', ['meta']).preparedMeta
      .parameters.fileName;
    return typeof fileName === 'string' && fileName.startsWith(ioStoriesPrefix);
  } catch {
    return false;
  }
};

export function ThemedDocsContainer(
  props: PropsWithChildren<DocsContainerProps>,
): ReactElement {
  const { context } = props;
  const [themeName, setThemeName] = useState(() =>
    toThemeName(
      (context as { store?: { userGlobals?: { globals?: Globals } } }).store
        ?.userGlobals?.globals,
    ),
  );

  // Docs pages are not re-rendered when globals change, so follow the theme
  // toolbar over the channel instead.
  useEffect(() => {
    const onGlobalsUpdated = ({ globals }: { globals: Globals }) =>
      setThemeName(toThemeName(globals));
    context.channel.on(GLOBALS_UPDATED, onGlobalsUpdated);
    return () => context.channel.off(GLOBALS_UPDATED, onGlobalsUpdated);
  }, [context.channel]);

  // Pages without stories never run the theme decorator, so set the
  // attribute here too.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeName);
  }, [themeName]);

  return h(
    DocsContainer,
    { ...props, theme: docsThemes[themeName] },
    isIoPage(context) && h('span', { className: 'io-docs-page', hidden: true }),
    props.children,
  );
}
