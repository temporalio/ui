<script lang="ts">
  import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';

  const dispatch = createEventDispatcher();

  let monaco: typeof Monaco;
  let editor: Monaco.editor.IStandaloneCodeEditor;
  let container: HTMLDivElement;

  export let content = '';

  onMount(async () => {
    monaco = (await import('./index')).default;

    const editor = monaco.editor.create(container, {
      language: 'markdown',
      theme: 'vs-dark',
    });

    const model = monaco.editor.createModel(content, 'markdown');

    model.onDidChangeContent(() => {
      const value = model.getValue();
      dispatch('change', { value });
    });

    editor.setModel(model);
  });

  onDestroy(() => {
    monaco?.editor.getModels().forEach((model) => model.dispose());
    editor?.dispose();
  });
</script>

<div class="h-full" bind:this={container} />
