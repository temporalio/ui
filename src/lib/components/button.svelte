<script lang="ts">
  export let disabled: boolean = false;
  export let variant: string = 'primary';
  export let as: string = 'button';
  export let active: boolean = false;
  export let size: string = 'small';
  export let href: string | null = null;
</script>

{#if as === 'button'}
  <button
    on:click
    class:selected={active}
    {disabled}
    class={`${size} ${variant}`}><slot /></button
  >
{:else}
  <a
    {href}
    on:click
    class:selected={active}
    {disabled}
    class={`${size} ${variant}`}><slot /></a
  >
{/if}

<style lang="postcss">
  .small {
    @apply text-sm;
  }

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
