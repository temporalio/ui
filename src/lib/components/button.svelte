<script lang="ts">
  import Icon from 'svelte-fa';
  import { faSpinner } from '@fortawesome/free-solid-svg-icons';

  export let disabled: boolean = false;
  export let secondary: boolean = false;
  export let destroy: boolean = false;
  export let loading: boolean = false;
  export let as: string = 'button';
  export let active: boolean = false;
  export let large: boolean = false;
  export let href: string | null = null;
</script>

{#if as === 'button'}
  <button
    on:click
    class="flex items-center justify-center text-sm primary"
    class:selected={active}
    class:large
    class:secondary
    class:destroy
    {disabled}
    >{#if loading}
      <span class="animate-spin"> <Icon icon={faSpinner} scale={1} /></span>
    {:else}
      <slot />
    {/if}
  </button>
{:else}
  <a
    {href}
    on:click
    class="flex items-center justify-center text-sm primary"
    class:selected={active}
    class:large
    class:secondary
    class:destroy
    {disabled}
    >{#if loading}
      <span class="animate-spin"> <Icon icon={faSpinner} scale={1} /></span>
    {:else}
      <slot />
    {/if}</a
  >
{/if}

<style lang="postcss">
  .large {
    @apply text-lg;
  }

  .primary {
    @apply text-white bg-primary border-2 rounded-lg py-2 px-4 transition-colors;
  }

  .primary:disabled {
    @apply text-purple-400 border-purple-400 cursor-not-allowed;
  }

  .primary:hover:enabled {
    @apply bg-secondary;
  }

  .secondary {
    @apply text-white bg-secondary border-2 rounded-lg px-2 transition-colors;
  }

  .secondary:disabled {
    @apply text-purple-400 border-purple-400 cursor-not-allowed;
  }

  .secondary:hover:enabled {
    @apply text-white bg-purple-300;
  }

  .destroy {
    @apply text-white bg-danger border-2 rounded-lg py-1 px-5 transition-colors;
  }

  .destroy:disabled {
    @apply text-red-400 border-red-400 cursor-not-allowed;
  }

  .destroy:hover:enabled {
    @apply bg-white text-red-400 border-red-400;
  }

  .selected {
    @apply text-white bg-purple-600 border-purple-200;
  }
</style>
