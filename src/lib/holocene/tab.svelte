<script lang="ts">
  export let href = '';
  export let label: string;
  export let amount: number = null;
  export let active = false;
  export let disabled = false;
</script>

{#if href}
  <a
    class="block whitespace-nowrap border-b-2 border-white text-sm hover:border-b-2 hover:border-blue-700 md:text-base"
    class:active
    class:disabled
    tabindex="0"
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
    class:disabled
    data-cy={$$props.dataCy}
    tabindex="0"
    on:click
    on:keypress
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

  a.disabled {
    @apply pointer-events-none border-0 text-gray-800 opacity-50;
  }
  div.active {
    @apply border-b-2 border-blue-700 font-medium text-blue-700;
  }

  div.disabled {
    @apply cursor-not-allowed border-0 text-gray-800 opacity-50;
  }
</style>
