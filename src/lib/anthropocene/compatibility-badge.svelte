<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/anthropocene/icon/icon.svelte';

  interface Props {
    defaultVersion?: boolean;
    active?: boolean;
    buildId: string;
    'overall-default-worker'?: Snippet;
    'default-worker'?: Snippet;
  }

  let {
    defaultVersion = false,
    active = false,
    buildId,
    'overall-default-worker': overallDefaultWorker,
    'default-worker': defaultWorker,
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
      {#if overallDefaultWorker}{@render overallDefaultWorker()}{/if}
      {#if defaultWorker}{@render defaultWorker()}{/if}
    </span>
  {:else if buildId}
    <span
      class="flex items-center gap-1 rounded-sm border border-subtle px-1 text-sm text-primary"
    >
      <Icon name="merge" />{buildId}
    </span>
  {/if}
</p>
