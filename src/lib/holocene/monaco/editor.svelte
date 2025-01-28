<script lang="ts">
  import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
  import { onDestroy, onMount } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { useDarkMode } from '$lib/utilities/dark-mode/dark-mode';

  let monaco: typeof Monaco = $state();
  let editor: Monaco.editor.IStandaloneCodeEditor = $state();
  let container: HTMLDivElement = $state();

  interface Props {
    content?: string;
    class?: string;
    change?: (args: { value: string }) => void;
  }

  let { content = '', class: className = '', change }: Props = $props();

  onMount(async () => {
    monaco = (await import('./index')).default;

    const editor = monaco.editor.create(container, {
      language: 'markdown',
    });

    const model = monaco.editor.createModel(content, 'markdown');

    model.onDidChangeContent(() => {
      const value = model.getValue();
      change({ value });
    });

    editor.setModel(model);
  });

  $effect(() => {
    if ($useDarkMode) {
      monaco?.editor.setTheme('vs-dark');
    } else {
      monaco?.editor.setTheme('vs');
    }
  });

  onDestroy(() => {
    monaco?.editor.getModels().forEach((model) => model.dispose());
    editor?.dispose();
  });
</script>

<div class={merge('h-full min-h-80', className)} bind:this={container}></div>
