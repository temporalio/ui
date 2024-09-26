<script lang="ts">
  import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';

  import { useDarkMode } from '$lib/utilities/dark-mode/dark-mode';

  const dispatch = createEventDispatcher();

  let monaco: typeof Monaco;
  let editor: Monaco.editor.IStandaloneCodeEditor;
  let container: HTMLDivElement;

  export let content = '';

  onMount(async () => {
    monaco = (await import('./index')).default;

    const editor = monaco.editor.create(container, {
      language: 'markdown',
    });

    const model = monaco.editor.createModel(content, 'markdown');

    model.onDidChangeContent(() => {
      const value = model.getValue();
      dispatch('change', { value });
    });

    editor.setModel(model);
  });

  $: {
    if ($useDarkMode) {
      monaco?.editor.setTheme('vs-dark');
    } else {
      monaco?.editor.setTheme('vs');
    }
  }

  onDestroy(() => {
    monaco?.editor.getModels().forEach((model) => model.dispose());
    editor?.dispose();
  });
</script>

<div class="h-full min-h-80" bind:this={container} />
