<script lang="ts">
  export let href: string;
  export let label: string;
  export let amount: number | Long.Long = null;
  export let active = false;
</script>

<a
  class="block whitespace-nowrap text-sm md:text-base underline-offset-4 hover:text-blue-700 hover:underline"
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
    @apply underline font-medium text-blue-700;
  }
</style>
