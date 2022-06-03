<script lang="ts">
  import Icon from 'svelte-fa';
  import { faSpinner } from '@fortawesome/free-solid-svg-icons';
  import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

  export let disabled: boolean = false;
  export let secondary: boolean = false;
  export let destroy: boolean = false;
  export let loading: boolean = false;
  export let login: boolean = false;
  export let thin: boolean = false;
  export let href: string = null;
  export let active: boolean = false;
  export let large: boolean = false;
  export let as: 'button' | 'anchor' = href ? 'anchor' : 'button';
  export let icon: IconDefinition = null;
  export let classes: string = $$props.class;
  export let dataCy: string = $$props.dataCy;
</script>

{#if as === 'button'}
  <button
    on:click
    class={`primary flex items-center justify-center gap-2 text-sm ${classes}`}
    class:selected={active}
    class:large
    class:secondary
    class:destroy
    class:login
    class:thin
    data-cy={dataCy}
    {disabled}
  >
    {#if icon}
      <span class:animate-spin={loading}>
        <Icon icon={loading ? faSpinner : icon} scale={1} />
      </span>
    {/if}
    <slot />
  </button>
{:else}
  <a
    {href}
    on:click
    class={`primary flex w-fit items-center justify-center gap-2 text-sm ${classes}`}
    class:selected={active}
    class:large
    class:secondary
    class:destroy
    class:disabled
    class:login
    class:thin
    data-cy={dataCy}
    {disabled}
  >
    {#if icon}
      <span class:animate-spin={loading}>
        <Icon icon={loading ? faSpinner : icon} scale={1} />
      </span>
    {/if}
    <slot />
  </a>
{/if}

<style lang="postcss">
  .large {
    @apply text-lg;
  }

  .primary {
    @apply rounded-lg border-2 bg-primary py-2 px-4 text-white transition-colors;
  }

  .primary:disabled {
    @apply cursor-not-allowed border-purple-400 bg-gray-400 text-purple-400;
  }

  .primary:hover:enabled {
    @apply bg-blue-700;
  }

  .secondary {
    @apply rounded-lg border-2 bg-white py-2 px-4 text-gray-800 transition-colors;
  }

  .secondary:disabled {
    @apply cursor-not-allowed border-purple-400 bg-gray-400 text-purple-400;
  }

  .secondary:hover:enabled {
    @apply bg-gray-900 text-white;
  }

  .destroy {
    @apply rounded-lg border-2 border-danger bg-danger px-5 text-white transition-colors;
  }

  .destroy:disabled {
    @apply cursor-not-allowed border-red-400 bg-gray-400 text-red-400;
  }

  .destroy:hover:enabled {
    @apply border-red-900 bg-red-900 text-white;
  }

  .selected {
    @apply border-purple-200 bg-purple-600 text-white;
  }

  .login {
    @apply mx-auto bg-gray-900 py-4;
  }

  .thin {
    @apply py-1;
  }
</style>
