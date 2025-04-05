<script lang="ts">
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';

  export let label: string;
  export let value: string;
  export let href: string | undefined = undefined;
  export let icon: IconName | undefined = undefined;
  export let current = false;
</script>

<div
  class="flex w-full flex-col items-center gap-2 border border-subtle px-1 py-4 text-center text-xs transition-all lg:text-base {current &&
    'bg-subtle'} max-w-md"
>
  {#if icon}
    <Icon name={icon} />
  {/if}
  <p class="font-mono">{label}</p>
  <div class="px-1 lg:px-2">
    {#if href}
      <Link {href}>
        {value}
      </Link>
    {:else}
      <p>{value}</p>
    {/if}
  </div>
</div>
