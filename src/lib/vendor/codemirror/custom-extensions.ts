import { json } from '@codemirror/lang-json';
import { HighlightStyle, StreamLanguage } from '@codemirror/language';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import colors from 'tailwindcss/colors';

import { css } from '$lib/theme/utilities';

export type EditorLanguage = 'json' | 'text' | 'shell';

export const getEditorTheme = ({ isDark }: { isDark: boolean }) =>
  EditorView.theme(
    {
      '&': {
        color: css('--color-text-primary'),
        backgroundColor: css('--color-surface-code-block'),
        borderWidth: '1px',
        borderColor: css('--color-border-subtle'),
        height: '100%',
      },
      '.cm-scroller': {
        fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
        padding: '0.5rem',
      },
      '.cm-content': {
        caretColor: css('--color-text-primary'),
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

export const getActionsTheme = ({ hasActions }: { hasActions: boolean }) =>
  EditorView.theme({
    '.cm-content': {
      ...(hasActions ? { marginRight: '1.75rem' } : {}),
    },
  });

export const getHeightTheme = ({
  maxHeight,
  minHeight,
  maximized,
}: {
  maxHeight: number;
  minHeight: number;
  maximized: boolean;
}) =>
  EditorView.theme({
    '&': {
      ...(minHeight && !maximized ? { 'min-height': `${minHeight}px` } : {}),
      ...(maxHeight && !maximized ? { 'max-height': `${maxHeight}px` } : {}),
    },
  });

export const highlightStyles = HighlightStyle.define(
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

export const getLineBreakExtension = (editable: boolean) =>
  EditorView.updateListener.of((update) => {
    if (editable) return;

    const newText = update.state.doc.toString().replace(/\\n/g, '\n');
    if (newText !== update.state.doc.toString()) {
      update.view.dispatch({
        changes: { from: 0, to: update.state.doc.length, insert: newText },
      });
    }
  });

export const getLanguageExtension = (language: EditorLanguage) =>
  ({
    json: json(),
    shell: StreamLanguage.define(shell),
  })[language] ?? undefined;
