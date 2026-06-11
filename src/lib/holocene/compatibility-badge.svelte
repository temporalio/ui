<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';

  export let defaultVersion = false;
  export let active = false;
  export let buildId: string;
</script>

<p class="flex gap-2 font-mono select-all">
  {#if defaultVersion && buildId}
    <span
      class={merge(
        'border-subtle text-primary flex items-center gap-1 rounded-xs border px-1 text-sm',
        active && 'border-green-200 bg-green-200 text-black',
      )}
    >
      <Icon name="merge" />{buildId}
      <slot name="overall-default-worker" />
      <slot name="default-worker" />
    </span>
  {:else if buildId}
    <span
      class="border-subtle text-primary flex items-center gap-1 rounded-xs border px-1 text-sm"
    >
      <Icon name="merge" />{buildId}
    </span>
  {/if}
</p>
