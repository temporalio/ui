<script lang="ts">
  export let href: string;
  export let label: string;
  export let amount: number | Long.Long = null;
  export let active = false;
</script>

{#if href}
  <a
    class="block whitespace-nowrap border-b-2 border-white text-sm hover:border-b-2 hover:border-blue-700 md:text-base"
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
{:else}
  <div
    class="block cursor-pointer whitespace-nowrap border-b-2 border-white text-sm hover:border-b-2 hover:border-blue-700 md:text-base"
    class:active
    data-cy={$$props.dataCy}
    on:click
  >
    {#if amount || amount === 0}
      {label}
      <span class="rounded-sm bg-blue-100 px-2 text-blue-700">{amount}</span>
    {:else}
      {label}
    {/if}
  </div>
{/if}

<style lang="postcss">
  a.active {
    @apply border-b-2 border-blue-700 font-medium text-blue-700;
  }
  div.active {
    @apply border-b-2 border-blue-700 font-medium text-blue-700;
  }
</style>
