import { HighlightStyle } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import colors from 'tailwindcss/colors';

export const TEMPORAL_THEME = EditorView.theme(
  {
    '&': {
      color: 'white',
      backgroundColor: colors.gray['900'],
      borderRadius: '0.25rem',
    },
    '.cm-matchingBracket': {
      backgroundColor: colors.gray['800'],
    },
    '.cm-scroller': {
      fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    },
    '.cm-content': {
      caretColor: colors.white,
    },
    '.cm-editor&.cm-focused': {
      outline: `1px solid ${colors.blue['700']}`,
    },
    '&.cm-focused .cm-matchingBracket': {
      backgroundColor: colors.gray['700'],
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: colors.white,
    },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: colors.gray['700'],
    },
  },
  { dark: false },
);

export const TEMPORAL_SYNTAX = HighlightStyle.define([
  { tag: tags.punctuation, color: colors.gray['200'] },
  { tag: tags.string, color: colors.green['200'] },
  { tag: tags.propertyName, color: colors.purple['200'] },
  { tag: tags.bool, color: colors.indigo['200'] },
  { tag: tags.number, color: colors.indigo['200'] },
  { tag: tags.operator, color: colors.purple['400'] },
]);
