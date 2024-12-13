import { HighlightStyle } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import colors from 'tailwindcss/colors';

import { css } from '$lib/theme/utilities';

export const TEMPORAL_THEME = ({
  isDark,
  copyable,
}: {
  isDark: boolean;
  copyable: boolean;
}) =>
  EditorView.theme(
    {
      '&': {
        color: css('--color-text-primary'),
        backgroundColor: css('--color-surface-primary'),
        borderWidth: '1px',
        borderColor: css('--color-border-subtle'),
        padding: '0.5rem',
      },
      '.cm-scroller': {
        fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
      },
      '.cm-content': {
        caretColor: css('--color-text-primary'),
        fontSize: '0.875em',
        ...(copyable && { marginRight: '1.75rem' }),
      },
      '.cm-editor&.cm-focused': {
        outline: `3px solid ${colors.indigo['600']}`,
      },
      '.cm-gutters': {
        backgroundColor: 'transparent',
        borderRight: 'none',
      },
    },
    { dark: isDark },
  );

export const TEMPORAL_SYNTAX = HighlightStyle.define(
  [
    { tag: tags.punctuation, color: css('--color-text-primary') },
    { tag: tags.string, color: css('--color-text-primary') },
    { tag: tags.propertyName, color: css('--color-text-brand') },
    { tag: tags.bool, color: css('--color-text-primary') },
    { tag: tags.number, color: css('--color-text-primary') },
    { tag: tags.operator, color: css('--color-text-pink') },
    { tag: tags.comment, color: css('--color-text-success') },
    { tag: tags.variableName, color: css('--color-text-pink') },
  ],
  { themeType: 'light' },
);
