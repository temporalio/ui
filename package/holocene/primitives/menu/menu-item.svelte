<script>export let dark = false;
export let selected = false;
export let destructive = false;
export let active = false;
export let disabled = false;
export let href = '';
</script>

{#if href}
  <a
    {href}
    role="menuitem"
    class:dark
    class:destructive
    class:selected
    class:active
    class:disabled
    {disabled}
    class="menu-item inline-block {$$props.class}"
  >
    <slot />
  </a>
{:else}
  <li
    on:click|preventDefault
    role="menuitem"
    class:dark
    class:destructive
    class:selected
    class:active
    class:disabled
    class="menu-item {$$props.class}"
  >
    <slot />
  </li>
{/if}

<style>
  .menu-item {

    width: 100%;

    cursor: pointer;

    list-style-type: none;

    --tw-bg-opacity: 1;

    background-color: rgb(255 255 255 / var(--tw-bg-opacity));

    padding: 1rem;

    font-family: Poppins, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

    font-size: 0.875rem;

    line-height: 1.25rem;

    font-weight: 500;

    --tw-text-opacity: 1;

    color: rgb(24 24 27 / var(--tw-text-opacity))
}

.menu-item:hover {

    --tw-bg-opacity: 1;

    background-color: rgb(250 250 250 / var(--tw-bg-opacity))
}

  .dark {

    --tw-bg-opacity: 1;

    background-color: rgb(24 24 27 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(255 255 255 / var(--tw-text-opacity))
}

  .dark:hover {

    --tw-bg-opacity: 1;

    background-color: rgb(39 39 42 / var(--tw-bg-opacity))
}

  .dark.selected, 
    .dark.active {

    --tw-bg-opacity: 1;

    background-color: rgb(39 39 42 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(219 234 254 / var(--tw-text-opacity))
}

  .active, 
  .selected {

    --tw-text-opacity: 1;

    color: rgb(29 78 216 / var(--tw-text-opacity))
}

  .destructive {

    --tw-text-opacity: 1;

    color: rgb(185 28 28 / var(--tw-text-opacity))
}

  .destructive:hover {

    --tw-bg-opacity: 1;

    background-color: rgb(254 242 242 / var(--tw-bg-opacity))
}

  .disabled {

    pointer-events: none;

    --tw-text-opacity: 1;

    color: rgb(113 113 122 / var(--tw-text-opacity))
}</style>
