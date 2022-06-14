<script lang="ts">
  import { page } from '$app/stores';

  export let href: string;
  export let label: string;
  export let amount: number | Long.Long = null;

  $: active = $page.url.pathname.includes(href);
</script>

<a
  class="block whitespace-nowrap text-sm md:text-base"
  class:active
  {href}
  data-cy={$$props.dataCy}
>
  {#if amount || amount === 0}
    {label}
    <span class="rounded-sm bg-blue-100 px-2 text-blue-700">{amount}</span>
  {:else}
    {label}
  {/if}
</a>

<style lang="postcss">
  a.active {
    @apply rounded-b-sm border-b-2 border-blue-700 font-medium text-blue-700;
  }
</style>
