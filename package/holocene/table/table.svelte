<script>export let variant = 'fancy';
</script>

<table class="{variant} {$$props.class}">
  <thead>
    <slot name="headers" />
  </thead>
  <tbody>
    <slot />
  </tbody>
</table>

<style>
  table thead :global(th) {
    text-align: left;
    font-family: Poppins, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 500
}
    table tbody :global(td) {
    text-align: left;
    font-size: 0.875rem;
    line-height: 1.25rem
}

  table.fancy {
    border-collapse: separate;
    --tw-border-spacing-x: 0px;
    --tw-border-spacing-y: 0px;
    border-spacing: var(--tw-border-spacing-x) var(--tw-border-spacing-y);
    border-radius: 0.5rem;
    --tw-border-opacity: 1;
    border-color: rgb(212 212 216 / var(--tw-border-opacity))
}

  table.fancy thead {
    --tw-bg-opacity: 1;
    background-color: rgb(24 24 27 / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: rgb(244 244 245 / var(--tw-text-opacity))
}

  table.fancy thead :global(th) {
    border-top-width: 1px;
    --tw-border-opacity: 1;
    border-color: rgb(212 212 216 / var(--tw-border-opacity));
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    padding-left: 0.25rem;
    padding-right: 0.25rem
}

  table.fancy thead :global(th):first-child {
    width: 1px;
    border-top-left-radius: 0.5rem;
    border-left-width: 1px;
    --tw-border-opacity: 1;
    border-color: rgb(212 212 216 / var(--tw-border-opacity))
}

  table.fancy thead :global(th):last-child {
    width: 1px;
    border-top-right-radius: 0.5rem;
    border-right-width: 1px;
    --tw-border-opacity: 1;
    border-color: rgb(212 212 216 / var(--tw-border-opacity))
}

  table.fancy tbody :global(td) {
    border-top-width: 1px;
    --tw-border-opacity: 1;
    border-color: rgb(212 212 216 / var(--tw-border-opacity));
    padding-left: 0.25rem;
    padding-right: 0.25rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    font-size: 0.875rem;
    line-height: 1.25rem
}

  table.fancy tbody :global(td:first-child) {
    border-left-width: 1px;
    --tw-border-opacity: 1;
    border-color: rgb(212 212 216 / var(--tw-border-opacity))
}

  table.fancy tbody :global(td:last-child) {
    width: 0px;
    border-right-width: 1px;
    --tw-border-opacity: 1;
    border-color: rgb(212 212 216 / var(--tw-border-opacity));
    padding: 0px
}

  table.fancy tbody :global(:last-child) :global(td) {
    border-bottom-width: 1px;
    --tw-border-opacity: 1;
    border-color: rgb(212 212 216 / var(--tw-border-opacity))
}

  table.fancy tbody :global(:last-child) :global(td:first-child) {
    border-bottom-left-radius: 0.5rem
}

  table.fancy tbody :global(:last-child) :global(td:last-child) {
    border-bottom-right-radius: 0.5rem
}

  table.simple thead :global(th) {
    border-bottom-width: 1px;
    --tw-border-opacity: 1;
    border-color: rgb(24 24 27 / var(--tw-border-opacity));
    padding-top: 0.5rem;
    padding-bottom: 0.5rem
}

  table.simple tbody :global(td) {
    border-bottom-width: 1px;
    --tw-border-opacity: 1;
    border-color: rgb(212 212 216 / var(--tw-border-opacity));
    padding-top: 0.5rem;
    padding-bottom: 0.5rem
}

  table.simple:last-child {
    border-bottom-width: 0px
}</style>
