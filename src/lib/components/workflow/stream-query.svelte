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

  function onCompletion(query: string) {
    try {
      $workflowFilters = toListWorkflowFilters(query, $searchAttributes);
    } catch (e) {
      console.error(e);
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
        console.log('Stream completed (inline):', data);

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

<form onsubmit={handleSubmit} class="space-y-4">
  <div class="relative">
    <Input
      id="prompt-input"
      label="Prompt"
      labelHidden
      bind:value={inputValue}
      on:keydown={handleKeydown}
      placeholder="Enter your prompt..."
      disabled={streamStore.isStreaming}
    />
    <div class="absolute inset-y-0 right-0 flex items-center pr-2">
      {#if streamStore.isStreaming}
        <Button size="xs" on:click={() => streamStore.cancel()}>Cancel</Button>
      {:else}
        <Button size="xs" type="submit" disabled={!inputValue.trim()}
          >Stream</Button
        >
      {/if}
    </div>
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

{#if streamStore.response || streamStore.isStreaming}
  <div class="relative">
    <div class="absolute right-2 top-2 flex items-center gap-2">
      {#if streamStore.isStreaming}
        <div
          class="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
        >
          <div class="h-2 w-2 animate-pulse rounded-full bg-blue-600"></div>
          Streaming...
        </div>
      {/if}

      {#if streamStore.response && !streamStore.isStreaming}
        <button
          onclick={() => navigator.clipboard.writeText(streamStore.response)}
          class="text-gray-600 dark:text-gray-400 hover:text-gray-900 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md px-3 py-1 text-sm transition-colors dark:hover:text-white"
        >
          Copy
        </button>
      {/if}
    </div>

    <CodeBlock content={streamStore.response} />
  </div>
{/if}

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
