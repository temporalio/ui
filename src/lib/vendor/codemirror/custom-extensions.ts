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
import type { Extension } from '@codemirror/state';
import type { DecorationSet, ViewUpdate } from '@codemirror/view';
import {
  Decoration,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  WidgetType,
} from '@codemirror/view';
import { tags } from '@lezer/highlight';

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
    color: 'var(--color-content-primary)',
    backgroundColor: 'var(--color-surface-overlay-primary)',
    height: '100%',
  },
  '.cm-scroller': {
    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    // Ensure inner scroller reliably captures wheel/touchpad scroll,
    // especially on Firefox with mouse wheels.
    overflow: 'auto',
  },
  '.cm-content': {
    caretColor: 'var(--color-content-primary)',
    fontSize: '0.875em',
  },
  '.cm-editor&.cm-focused': {
    outline: '2px solid var(--color-interactive-primary)',
    outlineOffset: '2px',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    borderRight: 'none',
  },
};

const headerStyles = (header: boolean): Record<string, string> =>
  header
    ? {}
    : {
        borderWidth: '1px',
        borderColor: 'var(--color-border-secondary)',
      };

export const getEditorTheme = (isDark: boolean, header: boolean) =>
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
        color: 'var(--color-content-primary)',
        borderRight: '1px solid var(--color-border-primary)',
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
    {
      tag: tags.punctuation,
      color: 'var(--color-content-primary)',
    },
    { tag: tags.string, color: 'var(--color-content-primary)' },
    { tag: tags.propertyName, color: 'var(--color-content-brand)' },
    { tag: tags.bool, color: 'var(--color-content-primary)' },
    { tag: tags.number, color: 'var(--color-content-primary)' },
    { tag: tags.operator, color: 'var(--color-content-brand)' },
    { tag: tags.comment, color: 'var(--color-content-tertiary)' },
    {
      tag: tags.variableName,
      color: 'var(--color-content-brand)',
    },
  ],
  { themeType: 'light' },
);

class LineBreakWidget extends WidgetType {
  toDOM() {
    return document.createElement('br');
  }
}

const lineBreakDecorator = new MatchDecorator({
  regexp: /\\n/g,
  decoration: Decoration.replace({ widget: new LineBreakWidget() }),
});

export const getLineBreakExtension = (editable: boolean): Extension => {
  if (editable) return [];

  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      constructor(view: EditorView) {
        this.decorations = lineBreakDecorator.createDeco(view);
      }
      update(update: ViewUpdate) {
        this.decorations = lineBreakDecorator.updateDeco(
          update,
          this.decorations,
        );
      }
    },
    { decorations: (v) => v.decorations },
  );
};

export const getLanguageExtension = (language: EditorLanguage) =>
  (
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
    }) as Partial<Record<EditorLanguage, Extension>>
  )[language] ?? undefined;
