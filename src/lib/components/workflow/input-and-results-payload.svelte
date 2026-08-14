<script lang="ts">
  import type { Snippet } from 'svelte';

  import PayloadCodeBlock, {
    type PayloadDownloadFilenameData,
  } from '$lib/components/payload/payload-code-block.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { systemNexusInputRenderer } from '$lib/system-nexus-endpoints';
  import type { Payload, Payloads } from '$lib/types';
  import { isRawPayload } from '$lib/utilities/decode-payload';
  import type { CompletionEventAttributes } from '$lib/utilities/get-started-completed-and-task-failed-events';

  type Props = {
    title: string;
    titleSnippet?: Snippet;
    content?: Payloads | CompletionEventAttributes | Payload;
    isPending?: boolean;
    payloadDownloadFilenameData: PayloadDownloadFilenameData;
  };
  let {
    title,
    titleSnippet = defaultTitleSnippet,
    content,
    isPending = false,
    payloadDownloadFilenameData,
  }: Props = $props();

  const MAX_HEIGHT = 300;

  const NexusInputRenderer = $derived(
    isRawPayload(content) ? systemNexusInputRenderer(content as Payload) : null,
  );
</script>

{#snippet defaultTitleSnippet()}
  <h3 class="flex items-center gap-2 text-xs text-secondary">
    {title}
  </h3>
{/snippet}

<div class="flex w-full grow flex-col gap-2">
  {@render titleSnippet()}
  {#if content && NexusInputRenderer}
    <NexusInputRenderer payload={content as Payload} maxHeight={MAX_HEIGHT} />
  {:else if content}
    <PayloadCodeBlock
      maxHeight={MAX_HEIGHT}
      value={content}
      label={title}
      filenameData={payloadDownloadFilenameData}
    />
  {:else}
    <CodeBlock
      content={isPending ? 'Results will appear upon completion.' : 'null'}
      label={title}
      language="text"
      copyable={false}
      maxHeight={MAX_HEIGHT}
    />
  {/if}
</div>
