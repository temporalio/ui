<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { EditorView } from '@codemirror/view';
  import { EditorState } from '@codemirror/state';
  import { json } from '@codemirror/lang-json';
  import { keymap } from '@codemirror/view';
  import {
    syntaxHighlighting,
    indentOnInput,
    bracketMatching,
    indentUnit,
  } from '@codemirror/language';
  import { historyKeymap, standardKeymap } from '@codemirror/commands';
  import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
  import {
    TEMPORAL_SYNTAX,
    TEMPORAL_THEME,
  } from '$lib/vendor/codemirror/theme';
  import type { HTMLAttributes } from 'svelte/elements';

  interface $$Props extends HTMLAttributes<HTMLDivElement> {
    value: string;
    class?: string;
  }

  const dispatch = createEventDispatcher<{ change: string }>();

  export let value: string;
  let className: string = null;
  export { className as class };

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
        syntaxHighlighting(TEMPORAL_SYNTAX, { fallback: true }),
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

<div bind:this={editor} class={className} {...$$restProps} />
