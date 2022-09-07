<script>import Option from './simple-option.svelte';
export let id;
export let value;
export let label = null;
export let dark = false;
export let arrow = false;
export let name = id;
export let options = [];
</script>

<div>
  <label class="hidden" for={id}>{label}</label>
  <select
    class="inline h-10 w-full rounded-lg border-2 px-2 text-base {$$props.class}"
    class:dark
    class:remove={arrow}
    {name}
    {id}
    bind:value
    on:change
    data-cy={$$props.dataCy}
  >
    <slot>
      {#each options as option}
        <Option value={option} />
      {/each}
    </slot>
  </select>
</div>

<style>
  select {
    --tw-text-opacity: 1;
    color: rgb(113 113 122 / var(--tw-text-opacity))
}

  .remove {
    height: 2rem;
    -webkit-appearance: none;
       -moz-appearance: none;
            appearance: none;
    border-radius: 0.75rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    padding-left: 0.75rem;
    font-size: 0.875rem;
    line-height: 1.25rem
}

  .dark {
    --tw-bg-opacity: 1;
    background-color: rgb(24 24 27 / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: rgb(255 255 255 / var(--tw-text-opacity))
}

  .arrow::after {
    margin-right: 1rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 400;
    --tw-text-opacity: 1;
    color: rgb(255 255 255 / var(--tw-text-opacity));
    font-family: 'Font Awesome 5 Free';
    content: '\f0dc'
}</style>
