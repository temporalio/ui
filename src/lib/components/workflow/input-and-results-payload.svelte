<script lang="ts">
  import type { Snippet } from 'svelte';

  import NexusOperationRenderer from '$lib/components/payload/nexus-operation-renderer.svelte';
  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import type { Payload, Payloads } from '$lib/types';
  import { isRawPayload } from '$lib/utilities/decode-payload';
  import type { CompletionEventAttributes } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import { describeNexusOperation } from '$lib/utilities/nexus-operation-registry';

  type Props = {
    title: string;
    titleSnippet?: Snippet;
    content: Payloads | CompletionEventAttributes | Payload;
    isPending?: boolean;
  };
  let {
    title,
    titleSnippet = defaultTitleSnippet,
    content,
    isPending = false,
  }: Props = $props();

  const MAX_HEIGHT = 300;

  const isNexusPayload = $derived(
    isRawPayload(content) &&
      describeNexusOperation(content as Payload) !== null,
  );
</script>

{#snippet defaultTitleSnippet()}
  <h3 class="flex items-center gap-2 text-xs text-secondary">
    {title}
  </h3>
{/snippet}

<div class="flex w-full grow flex-col gap-2">
  {@render titleSnippet()}
  {#if content && isNexusPayload}
    <NexusOperationRenderer
      payload={content as Payload}
      maxHeight={MAX_HEIGHT}
    />
  {:else if content}
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
