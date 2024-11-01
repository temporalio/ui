import { HighlightStyle } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import colors from 'tailwindcss/colors';

export const TEMPORAL_THEME = (isDark) =>
  EditorView.theme(
    {
      '&': {
        borderRadius: '0.25rem',
        padding: '0.5rem',
      },
      '.cm-scroller': {
        fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
      },
      '.cm-content': {
        fontSize: '0.875em',
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
    { tag: tags.punctuation, color: colors.slate['800'] },
    { tag: tags.string, color: colors.slate['800'] },
    { tag: tags.propertyName, color: colors.indigo['600'] },
    { tag: tags.bool, color: colors.slate['800'] },
    { tag: tags.number, color: colors.slate['800'] },
    { tag: tags.operator, color: colors.pink['400'] },
    { tag: tags.comment, color: colors.green['400'] },
    { tag: tags.variableName, color: colors.pink['600'] },
  ],
  { themeType: 'light' },
);

export const TEMPORAL_SYNTAX_DARK = HighlightStyle.define(
  [
    { tag: tags.punctuation, color: colors.slate['200'] },
    { tag: tags.string, color: colors.slate['200'] },
    { tag: tags.propertyName, color: colors.indigo['400'] },
    { tag: tags.bool, color: colors.slate['200'] },
    { tag: tags.number, color: colors.slate['200'] },
    { tag: tags.operator, color: colors.pink['500'] },
    { tag: tags.comment, color: colors.green['600'] },
    { tag: tags.variableName, color: colors.pink['500'] },
  ],
  { themeType: 'dark' },
);
