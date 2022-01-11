<script lang="ts">
  import { page } from '$app/stores';

  export let href: string;
  export let label: string;
  export let amount: number | Long.Long = null;

  $: active = $page.path.includes(href);
</script>

<a class="block" class:active {href}>
  {#if amount}
    {label}
    <span class="px-2 text-blue-700 bg-blue-100 rounded-sm">{amount}</span>
  {:else}
    {label}
  {/if}
</a>

<style lang="postcss">
  a.active {
    @apply border-b-2 rounded-b-sm border-blue-700 font-medium;
  }
</style>
