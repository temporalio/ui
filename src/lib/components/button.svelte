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
    class={`flex items-center gap-2 justify-center text-sm primary ${classes}`}
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
    class={`flex items-center gap-2 justify-center text-sm primary w-fit ${classes}`}
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
    @apply text-white bg-primary border-2 border-gray-900 rounded-lg py-2 px-4 transition-colors;
  }

  .primary:disabled {
    @apply text-gray-300 border-gray-300 cursor-not-allowed bg-gray-400;
  }

  .primary:hover:enabled {
    @apply bg-blue-700 border-blue-700;
  }

  .secondary {
    @apply text-gray-800 bg-white border-2 rounded-lg py-2 px-4 transition-colors;
  }

  .secondary:disabled {
    @apply text-purple-400 border-purple-400 cursor-not-allowed bg-gray-400;
  }

  .secondary:hover:enabled {
    @apply text-white bg-gray-400 border-gray-400;
  }

  .destroy {
    @apply text-white bg-danger border-danger border-2 rounded-lg px-5 transition-colors;
  }

  .destroy:disabled {
    @apply text-red-400 border-red-400 cursor-not-allowed bg-gray-400;
  }

  .destroy:hover:enabled {
    @apply bg-red-900 text-white border-red-900;
  }

  .selected {
    @apply text-white bg-purple-600 border-purple-200;
  }

  .login {
    @apply bg-gray-900 mx-auto py-4;
  }

  .thin {
    @apply py-1;
  }
</style>
