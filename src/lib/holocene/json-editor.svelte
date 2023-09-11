<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
  import { historyKeymap, standardKeymap } from '@codemirror/commands';
  import { json } from '@codemirror/lang-json';
  import {
    bracketMatching,
    indentOnInput,
    indentUnit,
    syntaxHighlighting,
  } from '@codemirror/language';
  import { EditorState } from '@codemirror/state';
  import { EditorView } from '@codemirror/view';
  import { keymap } from '@codemirror/view';
  import { createEventDispatcher, onMount } from 'svelte';

  import {
    TEMPORAL_SYNTAX,
    TEMPORAL_THEME,
  } from '$lib/vendor/codemirror/theme';

  interface $$Props extends HTMLAttributes<HTMLDivElement> {
    value: string;
    class?: string;
    readOnly?: boolean;
    inline?: boolean;
  }

  const dispatch = createEventDispatcher<{ change: string }>();

  export let value: string;
  let className: string = null;
  export { className as class };
  export let readOnly = false;
  export let inline = false;

  let editor: HTMLElement;
  let view: EditorView;

  const createEditorView = (): EditorView => {
    return new EditorView({
      parent: editor,
      state: createEditorState(
        inline ? JSON.stringify(value) : JSON.stringify(value, undefined, 2),
      ),
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
        EditorState.readOnly.of(readOnly),
      ],
    });
  };

  onMount(() => (view = createEditorView()));
</script>

<div
  on:keydown|stopPropagation
  bind:this={editor}
  class={className}
  {...$$restProps}
/>
