import { HighlightStyle } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';

import colors from '$lib/theme/colors.ts';

export const TEMPORAL_THEME = EditorView.theme(
  {
    '&': {
      color: 'white',
      backgroundColor: colors.slate['900'],
      borderRadius: '0.5rem',
      padding: '0.35rem',
    },
    '.cm-matchingBracket': {
      backgroundColor: colors.slate['800'],
    },
    '.cm-scroller': {
      fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    },
    '.cm-content': {
      caretColor: colors.white,
      fontSize: '0.875em',
    },
    '.cm-editor&.cm-focused': {
      outline: `1px solid ${colors.indigo['600']}`,
    },
    '&.cm-focused .cm-matchingBracket': {
      backgroundColor: colors.slate['700'],
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: colors.white,
    },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: colors.slate['700'],
    },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      color: colors.white,
      borderRight: 'none',
    },
    '.cm-line': {
      color: '#ccc',
    },
  },
  { dark: false },
);

export const TEMPORAL_SYNTAX = HighlightStyle.define([
  { tag: tags.punctuation, color: colors.slate['200'] },
  { tag: tags.string, color: colors.green['200'] },
  { tag: tags.propertyName, color: colors.purple['200'] },
  { tag: tags.bool, color: colors.indigo['200'] },
  { tag: tags.number, color: colors.indigo['200'] },
  { tag: tags.operator, color: colors.purple['400'] },
  { tag: tags.comment, color: colors.slate['400'] },
  { tag: tags.variableName, color: colors.green['200'] },
]);
