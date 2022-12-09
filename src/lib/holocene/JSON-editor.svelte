<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import colors from 'tailwindcss/colors';
  import { tags } from '@lezer/highlight';
  import { EditorView } from '@codemirror/view';
  import { EditorState } from '@codemirror/state';
  import { json } from '@codemirror/lang-json';
  import { keymap } from '@codemirror/view';
  import {
    HighlightStyle,
    syntaxHighlighting,
    indentOnInput,
    bracketMatching,
    indentUnit,
  } from '@codemirror/language';
  import { historyKeymap, standardKeymap } from '@codemirror/commands';
  import { autocompletion, closeBrackets } from '@codemirror/autocomplete';

  const TEMPORAL_THEME = EditorView.theme(
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

  const TEMPORAL_HIGHLIGHTING = HighlightStyle.define([
    { tag: tags.punctuation, color: colors.gray['200'] },
    { tag: tags.string, color: colors.green['200'] },
    { tag: tags.propertyName, color: colors.purple['200'] },
    { tag: tags.bool, color: colors.indigo['200'] },
    { tag: tags.number, color: colors.indigo['200'] },
    { tag: tags.operator, color: colors.purple['400'] },
  ]);

  const dispatch = createEventDispatcher<{ change: string }>();

  export let value: string;

  let editor: HTMLElement;
  let view: EditorView;

  const createEditorView = (): EditorView => {
    return new EditorView({
      parent: editor,
      state: createEditorState(value),
      dispatch(transaction) {
        view.update([transaction]);
        if (transaction.docChanged) {
          dispatch('change', view.state.doc.toString());
        }
      },
    });
  };

  const createEditorState = (value: string | null | undefined): EditorState => {
    return EditorState.create({
      doc: value,
      extensions: [
        keymap.of([...standardKeymap, ...historyKeymap]),
        TEMPORAL_THEME,
        syntaxHighlighting(TEMPORAL_HIGHLIGHTING, { fallback: true }),
        indentUnit.of('  '),
        closeBrackets(),
        autocompletion(),
        indentOnInput(),
        bracketMatching(),
        json(),
      ],
    });
  };

  onMount(() => (view = createEditorView()));
</script>

<div bind:this={editor} />
