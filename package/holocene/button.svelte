<script>import Icon from '$holocene/icon/icon.svelte';
import Badge from '$holocene/badge.svelte';
export let disabled = false;
export let variant = 'primary';
export let thin = false;
export let loading = false;
export let href = null;
export let target = '_self';
export let active = false;
export let large = false;
export let as = href ? 'anchor' : 'button';
export let icon = null;
export let classes = $$props.class;
export let dataCy = $$props.dataCy;
export let count = 0;
export let type = 'button';
</script>

{#if as === 'button'}
  <button
    on:click
    class="button {variant} {classes}"
    class:selected={active}
    class:large
    class:thin
    data-cy={dataCy}
    {type}
    {disabled}
  >
    {#if icon || loading}
      <span class:animate-spin={loading}>
        <Icon name={loading ? 'spinner' : icon} />
      </span>
    {/if}
    <slot />
    {#if count > 0}
      <Badge
        class="badge absolute top-0 right-0 origin-bottom-left origin-bottom-left translate-y-[-10px] translate-x-[10px]"
        type="count">{count}</Badge
      >
    {/if}
  </button>
{:else}
  <a
    {href}
    on:click
    class="button {variant} {classes}"
    class:selected={active}
    class:large
    class:disabled
    class:thin
    data-cy={dataCy}
    {target}
  >
    {#if icon || loading}
      <span class:animate-spin={loading}>
        <Icon name={loading ? 'spinner' : icon} />
      </span>
    {/if}
    <slot />
  </a>
{/if}

<style>
  .button {

    position: relative;

    display: flex;

    width: -webkit-fit-content;

    width: -moz-fit-content;

    width: fit-content;

    align-items: center;

    justify-content: center;

    gap: 0.5rem;

    border-radius: 0.25rem;

    font-family: Poppins, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

    font-size: 0.875rem;

    line-height: 1.25rem
}

  .primary, 
  .secondary, 
  .destructive, 
  .login {

    border-width: 1px;

    padding-top: 0.5rem;

    padding-bottom: 0.5rem;

    padding-left: 1rem;

    padding-right: 1rem;

    transition-property: color, background-color, border-color, fill, stroke, -webkit-text-decoration-color;

    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;

    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, -webkit-text-decoration-color;

    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

    transition-duration: 150ms
}

  .button:disabled {

    cursor: not-allowed
}

  a.disabled {

    pointer-events: none;

    opacity: 0.5
}

  a.disabled:hover {

    --tw-border-opacity: 1;

    border-color: rgb(39 39 42 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(255 255 255 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(39 39 42 / var(--tw-text-opacity))
}

  .large {

    font-size: 1.125rem;

    line-height: 1.75rem
}

  .primary, 
  .login {

    --tw-border-opacity: 1;

    border-color: rgb(24 24 27 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(24 24 27 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(255 255 255 / var(--tw-text-opacity))
}

  .primary:hover, 
  .login:hover {

    --tw-bg-opacity: 1;

    background-color: rgb(59 130 246 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(244 244 245 / var(--tw-text-opacity))
}

  .primary:disabled {

    opacity: 0.5
}

  .primary:disabled:hover {

    --tw-border-opacity: 1;

    border-color: rgb(24 24 27 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(24 24 27 / var(--tw-bg-opacity))
}

  .primary:hover {

    --tw-border-opacity: 1;

    border-color: rgb(29 78 216 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(29 78 216 / var(--tw-bg-opacity))
}

  .secondary {

    --tw-border-opacity: 1;

    border-color: rgb(39 39 42 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(255 255 255 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(39 39 42 / var(--tw-text-opacity))
}

  .secondary:hover {

    --tw-border-opacity: 1;

    border-color: rgb(24 24 27 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(24 24 27 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(255 255 255 / var(--tw-text-opacity))
}

  .secondary:disabled {

    opacity: 0.5
}

  .secondary:disabled:hover {

    --tw-border-opacity: 1;

    border-color: rgb(39 39 42 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(255 255 255 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(39 39 42 / var(--tw-text-opacity))
}

  .destructive {

    --tw-border-opacity: 1;

    border-color: rgb(185 28 28 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(185 28 28 / var(--tw-bg-opacity));

    padding-left: 1.25rem;

    padding-right: 1.25rem;

    --tw-text-opacity: 1;

    color: rgb(255 255 255 / var(--tw-text-opacity))
}

  .destructive:hover {

    --tw-border-opacity: 1;

    border-color: rgb(127 29 29 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(127 29 29 / var(--tw-bg-opacity))
}

  .destructive:disabled {

    opacity: 0.5
}

  .destructive:disabled:hover {

    --tw-border-opacity: 1;

    border-color: rgb(185 28 28 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(185 28 28 / var(--tw-bg-opacity))
}

  .link {

    border-width: 0px;

    background-image: none;

    padding: 0px;

    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

    font-size: 0.875rem;

    line-height: 1.25rem;

    -webkit-text-decoration-line: underline;

            text-decoration-line: underline;

    --tw-shadow: 0 0 #0000;

    --tw-shadow-colored: 0 0 #0000;

    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)
}

  .selected {

    --tw-bg-opacity: 1;

    background-color: rgb(147 51 234 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(255 255 255 / var(--tw-text-opacity))
}

  .login {

    margin-left: auto;

    margin-right: auto
}

  .thin {

    padding-top: 0.25rem;

    padding-bottom: 0.25rem
}</style>
