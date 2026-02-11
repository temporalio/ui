import { go } from '@codemirror/lang-go';
import { java } from '@codemirror/lang-java';
import { json } from '@codemirror/lang-json';
import { php } from '@codemirror/lang-php';
import { HighlightStyle, StreamLanguage } from '@codemirror/language';
import { csharp } from '@codemirror/legacy-modes/mode/clike';
import { typescript } from '@codemirror/legacy-modes/mode/javascript';
import { python } from '@codemirror/legacy-modes/mode/python';
import { ruby } from '@codemirror/legacy-modes/mode/ruby';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import colors from 'tailwindcss/colors';

import { css } from '$lib/theme/utilities';

export type EditorLanguage =
  | 'json'
  | 'text'
  | 'shell'
  | 'go'
  | 'typescript'
  | 'python'
  | 'dotnet'
  | 'php'
  | 'java'
  | 'ruby';

const baseTheme = {
  '&': {
    color: css('--color-text-primary'),
    backgroundColor: css('--color-surface-code-block'),
    height: '100%',
  },
  '.cm-scroller': {
    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    // Ensure inner scroller reliably captures wheel/touchpad scroll,
    // especially on Firefox with mouse wheels.
    overflow: 'auto',
  },
  '.cm-content': {
    caretColor: css('--color-text-primary'),
    fontSize: '0.875em',
  },
  '.cm-editor&.cm-focused': {
    outline: `2px solid ${colors.indigo['600']}`,
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    borderRight: 'none',
  },
};

const headerStyles = (header: boolean) =>
  header
    ? {}
    : {
        borderWidth: '1px',
        borderColor: css('--color-border-subtle'),
      };

export const getEditorTheme = (isDark: boolean, header) =>
  EditorView.theme(
    {
      ...baseTheme,
      '&': {
        ...baseTheme['&'],
        ...headerStyles(header),
      },
      '.cm-scroller': {
        ...baseTheme['.cm-scroller'],
        padding: '0.5rem',
      },
    },
    { dark: isDark },
  );

export const getEditorThemeWithLineNumbers = (
  isDark: boolean,
  header: boolean,
) =>
  EditorView.theme(
    {
      ...baseTheme,
      '&': {
        ...baseTheme['&'],
        ...headerStyles(header),
      },
      '.cm-gutters': {
        ...baseTheme['.cm-gutters'],
        color: css('--color-text-information'),
        borderRight: `1px solid ${css('--color-border-subtle')}`,
      },
      '.cm-gutter .cm-gutterElement': {
        padding: '0 0.5rem',
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
    { tag: tags.comment, color: css('--color-text-subtle') },
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
    java: java(),
    go: go(),
    php: php(),
    python: StreamLanguage.define(python),
    shell: StreamLanguage.define(shell),
    dotnet: StreamLanguage.define(csharp),
    ruby: StreamLanguage.define(ruby),
    typescript: StreamLanguage.define(typescript),
  })[language] ?? undefined;
