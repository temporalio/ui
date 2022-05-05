<script lang="ts">
  import { page } from '$app/stores';

  export let href: string;
  export let label: string;
  export let amount: number | Long.Long = null;

  $: active = $page.url.pathname.includes(href);
</script>

<a
  class="block text-sm md:text-base border-b-2 whitespace-nowrap"
  class:active
  {href}
  data-cy={$$props.dataCy}
>
  {#if amount || amount === 0}
    {label}
    <span class="px-2 text-blue-700 bg-blue-100 rounded-sm">{amount}</span>
  {:else}
    {label}
  {/if}
</a>

<style lang="postcss">
  a.active {
    @apply border-b-2 rounded-b-sm text-blue-700 border-blue-700 font-medium;
  }
</style>
