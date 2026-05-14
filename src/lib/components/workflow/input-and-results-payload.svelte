<script lang="ts">
  import type { Snippet } from 'svelte';

  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import type { Payloads } from '$lib/types';
  import type { CompletionEventAttributes } from '$lib/utilities/get-started-completed-and-task-failed-events';

  type Props = {
    title: string;
    titleSnippet?: Snippet;
    content: Payloads | CompletionEventAttributes;
    isPending?: boolean;
  };
  let {
    title,
    titleSnippet = defaultTitleSnippet,
    content,
    isPending = false,
  }: Props = $props();

  const MAX_HEIGHT = 300;
</script>

{#snippet defaultTitleSnippet()}
  <h3 class="flex items-center gap-2 text-xs text-secondary">
    {title}
  </h3>
{/snippet}

<div class="flex w-full grow flex-col gap-2">
  {@render titleSnippet()}
  {#if content}
    <PayloadCodeBlock maxHeight={MAX_HEIGHT} value={content} />
  {:else}
    <CodeBlock
      content={isPending ? 'Results will appear upon completion.' : 'null'}
      language="text"
      copyable={false}
      maxHeight={MAX_HEIGHT}
    />
  {/if}
</div>
