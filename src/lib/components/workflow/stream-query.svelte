<script lang="ts">
  import { onDestroy } from 'svelte';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { workflowFilters } from '$lib/stores/filters';
  import {
    customSearchAttributes,
    searchAttributes,
  } from '$lib/stores/search-attributes';
  import { createStreamStore } from '$lib/stores/stream.svelte.js';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  const streamStore = createStreamStore();
  let inputValue = $state(streamStore.response || '');
  let result = $derived(streamStore.response || '');

  function onCompletion(query: string) {
    try {
      $workflowFilters = toListWorkflowFilters(query, $searchAttributes);
    } catch (e) {
      console.error(e);
    }

    if (!query) {
      inputValue = '';
      result = '';
    }

    updateQueryParameters({
      url: page.url,
      parameter: 'query',
      value: query,
      allowEmpty: true,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!inputValue.trim() || streamStore.isStreaming) return;

    await streamStore.stream(inputValue, $customSearchAttributes, {
      onComplete: (data) => {
        if (data.aborted) {
          console.log('Stream was aborted by user');
        } else if (data.error) {
          console.error('Stream failed:', data.error);
        } else {
          onCompletion(data.response);
        }
      },
    });
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  onDestroy(() => {
    streamStore.cancel();
  });
</script>

<div class="flex flex-col gap-2">
  <form onsubmit={handleSubmit} class="space-y-4">
    <div class="flex items-center gap-2">
      <Input
        id="prompt-input"
        class="flex-1"
        label="Prompt"
        labelHidden
        bind:value={inputValue}
        on:keydown={handleKeydown}
        placeholder="Failed in the last 15 minutes"
        disabled={streamStore.isStreaming}
      />
      {#if streamStore.isStreaming}
        <Button on:click={() => streamStore.cancel()}>Cancel</Button>
      {:else}
        <Button type="submit" disabled={!inputValue.trim()}>Search</Button>
      {/if}
      <Button
        variant="ghost"
        disabled={!result.trim()}
        on:click={() => onCompletion('')}>Reset</Button
      >
    </div>

    {#if streamStore.error}
      <div
        class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
      >
        <p class="text-sm text-red-600 dark:text-red-400">
          Error: {streamStore.error}
        </p>
      </div>
    {/if}
  </form>

  {#if result}
    <CodeBlock content={result} />
  {/if}
</div>

<style>
  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0.5;
    }
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  code {
    font-family: 'Fira Code', Consolas, Monaco, 'Courier New', monospace;
  }
</style>
