<script lang="ts">
  import type { Snippet } from 'svelte';

  import { extractImageDataUris } from '$lib/utilities/extract-image-data-uris';

  type Props = {
    content: string;
    children: Snippet;
  };

  let { content, children }: Props = $props();

  const images = $derived(extractImageDataUris(content));
  const hasImages = $derived(images.length > 0);
  let showImage = $state(true);
  let brokenIndices: Set<number> = $state(new Set());
</script>

{#if hasImages}
  <div class="flex items-center gap-2 pb-1">
    <button
      class="rounded border border-subtle px-2 py-0.5 text-xs text-secondary hover:surface-interactive-secondary"
      onclick={() => (showImage = !showImage)}
    >
      {showImage ? 'View as JSON' : 'View as image'}
    </button>
  </div>
{/if}

{#if showImage}
  <div class="flex flex-col gap-3">
    {#each images as image, i (image.key)}
      {#if !brokenIndices.has(i)}
        <div class="flex flex-col gap-1">
          {#if image.key}
            <p class="text-xs text-secondary">{image.key}</p>
          {/if}
          <img
            src={image.dataUri}
            alt={image.key || 'image'}
            class="max-h-96 max-w-full rounded border border-subtle object-contain"
            onerror={() => {
              brokenIndices = new Set([...brokenIndices, i]);
            }}
          />
        </div>
      {/if}
    {/each}
  </div>
{:else}
  {@render children()}
{/if}
