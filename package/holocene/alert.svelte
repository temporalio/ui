<script>import Icon from '$holocene/icon/icon.svelte';
export let intent;
export let title;
export let icon = null;
</script>

<div class="alert {intent} {$$props.class}">
  {#if icon}
    <div>
      <Icon name={icon} />
    </div>
  {/if}
  <div class="ml-1">
    <h5 class="font-semibold">{title}</h5>
    {#if $$slots.default}
      <div class="content">
        <slot />
      </div>
    {/if}
  </div>
</div>

<style>
  .alert {

    display: flex;

    border-radius: 0.375rem;

    border-width: 1px;

    padding: 1.25rem;

    font-family: Poppins, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

    font-size: 0.875rem;

    line-height: 1.25rem
}

  .alert.success {

    --tw-border-opacity: 1;

    border-color: rgb(22 163 74 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(220 252 231 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(21 128 61 / var(--tw-text-opacity))
}

  .alert.info {

    --tw-border-opacity: 1;

    border-color: rgb(29 78 216 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(239 246 255 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(29 78 216 / var(--tw-text-opacity))
}

  .alert.error {

    --tw-border-opacity: 1;

    border-color: rgb(185 28 28 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(254 226 226 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(185 28 28 / var(--tw-text-opacity))
}

  .alert.warning {

    --tw-border-opacity: 1;

    border-color: rgb(161 98 7 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(254 249 195 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(161 98 7 / var(--tw-text-opacity))
}

  .content :global(> *) {

    font-family: Poppins, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

    font-size: 0.875rem;

    line-height: 1.25rem;

    font-weight: 400
}</style>
