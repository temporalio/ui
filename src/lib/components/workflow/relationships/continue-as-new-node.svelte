<script lang="ts">
  import Link from '$lib/holocene/link.svelte';

  export let label: string;
  export let value: string;
  export let href: string | undefined = undefined;
  export let current = false;
</script>

<div
  class="flex w-full flex-col items-center gap-2 px-1 py-4 text-center text-xs transition-all lg:text-base {current &&
    'bg-slate-500/30'} max-w-md"
>
  <p>{label}</p>
  <div class="h-12 w-12 bg-indigo-200 dark:bg-indigo-600" />
  {#if href}
    <Link {href}>
      {value}
    </Link>
  {:else}
    <p>{value}</p>
  {/if}
</div>
