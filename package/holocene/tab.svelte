<script>export let href = '';
export let label;
export let amount = null;
export let active = false;
export let disabled = false;
</script>

{#if href}
  <a
    class="block whitespace-nowrap border-b-2 border-white text-sm hover:border-b-2 hover:border-blue-700 md:text-base"
    class:active
    class:disabled
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

<style>
  a.active {

    border-bottom-width: 2px;

    --tw-border-opacity: 1;

    border-color: rgb(29 78 216 / var(--tw-border-opacity));

    font-weight: 500;

    --tw-text-opacity: 1;

    color: rgb(29 78 216 / var(--tw-text-opacity))
}

  a.disabled {

    pointer-events: none;

    border-width: 0px;

    --tw-text-opacity: 1;

    color: rgb(39 39 42 / var(--tw-text-opacity));

    opacity: 0.5
}
  div.active {

    border-bottom-width: 2px;

    --tw-border-opacity: 1;

    border-color: rgb(29 78 216 / var(--tw-border-opacity));

    font-weight: 500;

    --tw-text-opacity: 1;

    color: rgb(29 78 216 / var(--tw-text-opacity))
}

  div.disabled {

    cursor: not-allowed;

    border-width: 0px;

    --tw-text-opacity: 1;

    color: rgb(39 39 42 / var(--tw-text-opacity));

    opacity: 0.5
}</style>
