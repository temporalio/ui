<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';

  export let defaultVersion = false;
  export let active = false;
  export let buildId: string;
</script>

<p class="flex select-all gap-2 font-mono">
  {#if defaultVersion && buildId}
    <span
      class={merge(
        'flex items-center gap-1 rounded border px-1 text-sm',
        active && 'border-green-100 bg-green-100 text-green-800',
      )}
    >
      <Icon name="merge" />{buildId}
      <slot name="overall-default-worker" />
      <slot name="default-worker" />
    </span>
  {:else if buildId}
    <span class="flex items-center gap-1 rounded border px-1 text-sm">
      <Icon name="merge" />{buildId}
    </span>
  {/if}
</p>
