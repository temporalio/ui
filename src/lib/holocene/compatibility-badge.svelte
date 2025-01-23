<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';

  interface Props {
    defaultVersion?: boolean;
    active?: boolean;
    buildId: string;
    overallDefaultWorker?: Snippet;
    defaultWorker?: Snippet;
  }

  let {
    defaultVersion = false,
    active = false,
    buildId,
    overallDefaultWorker,
    defaultWorker,
  }: Props = $props();
</script>

<p class="flex select-all gap-2 font-mono">
  {#if defaultVersion && buildId}
    <span
      class={merge(
        'flex items-center gap-1 rounded-sm border border-subtle px-1 text-sm text-primary',
        active && 'border-green-200 bg-green-200 text-black',
      )}
    >
      <Icon name="merge" />{buildId}
      {@render overallDefaultWorker?.()}
      {@render defaultWorker?.()}
    </span>
  {:else if buildId}
    <span
      class="flex items-center gap-1 rounded-sm border border-subtle px-1 text-sm text-primary"
    >
      <Icon name="merge" />{buildId}
    </span>
  {/if}
</p>
