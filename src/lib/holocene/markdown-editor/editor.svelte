<script lang="ts">
  import { markdown } from '@codemirror/lang-markdown';
  import { EditorState } from '@codemirror/state';
  import { EditorView, lineNumbers } from '@codemirror/view';
  import { onMount } from 'svelte';

  import { getEditorThemeWithLineNumbers } from '$lib/vendor/codemirror/custom-extensions';

  interface Props {
    content: string;
    darkMode: boolean;
  }

  let { content = $bindable(''), darkMode }: Props = $props();
  let editorElement: HTMLElement | null = $state(null);
  let editorView: EditorView | null = $state(null);

  const createEditorView = () => {
    return new EditorView({
      parent: editorElement,
      state: EditorState.create({
        doc: content,
        extensions: [
          markdown(),
          lineNumbers(),
          getEditorThemeWithLineNumbers(darkMode, false),
        ],
      }),
      dispatch(transaction) {
        editorView.update([transaction]);
        if (transaction.docChanged) {
          content = editorView.state.doc.toString();
        }
      },
    });
  };

  onMount(() => {
    editorView = createEditorView();

    return () => {
      editorView.destroy();
    };
  });
</script>

<div bind:this={editorElement}></div>
