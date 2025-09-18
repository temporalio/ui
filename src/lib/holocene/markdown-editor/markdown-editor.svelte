<script lang="ts">
  import { markdown } from '@codemirror/lang-markdown';
  import { EditorState } from '@codemirror/state';
  import { EditorView, lineNumbers } from '@codemirror/view';
  import { onMount, tick } from 'svelte';

  import TabButton from '$lib/holocene/tab-buttons/tab-button.svelte';
  import TabButtons from '$lib/holocene/tab-buttons/tab-buttons.svelte';
  import { useDarkMode } from '$lib/utilities/dark-mode';
  import { getEditorThemeWithLineNumbers } from '$lib/vendor/codemirror/custom-extensions';

  import MarkdownPreview from './preview.svelte';

  interface Props {
    content: string;
  }

  let { content = $bindable('') }: Props = $props();
  let editorElement: HTMLElement | null = $state(null);
  let editorView: EditorView | null = $state(null);
  let activeTab: 'edit' | 'preview' = $state('edit');

  const createEditorView = () => {
    return new EditorView({
      parent: editorElement,
      state: EditorState.create({
        doc: content,
        extensions: [
          markdown(),
          lineNumbers(),
          getEditorThemeWithLineNumbers($useDarkMode, false),
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

  const setActiveTab = async (tab: 'edit' | 'preview') => {
    activeTab = tab;

    if (activeTab === 'edit') {
      // because we're mounting/unmounting the editor element, we have to wait until
      // the element is re-mounted before re-creating the editorView
      await tick();
      editorView = createEditorView();
    }
  };

  onMount(() => {
    editorView = createEditorView();

    return () => {
      editorView.destroy();
    };
  });
</script>

<div>
  <TabButtons>
    <TabButton
      on:click={() => setActiveTab('edit')}
      active={activeTab === 'edit'}>Edit</TabButton
    >
    <TabButton
      on:click={() => setActiveTab('preview')}
      active={activeTab === 'preview'}>Preview</TabButton
    >
  </TabButtons>

  {#if activeTab === 'edit'}
    <div bind:this={editorElement}></div>
  {:else}
    <MarkdownPreview {content} />
  {/if}
</div>
