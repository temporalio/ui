<script lang="ts">
  import Icon from '$holocene/icon/index.svelte';
  import type { IconName } from '$holocene/icon/paths';
  import Badge from '$holocene/badge.svelte';

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
  export let icon: IconName = null;
  export let iconScale: number = 1;
  export let classes: string = $$props.class;
  export let dataCy: string = $$props.dataCy;
  export let count: number = 0;
</script>

{#if as === 'button'}
  <button
    on:click
    class={`button primary ${classes}`}
    class:selected={active}
    class:large
    class:secondary
    class:destroy
    class:login
    class:thin
    data-cy={dataCy}
    {disabled}
  >
    {#if icon || loading}
      <span class:animate-spin={loading}>
        <Icon
          scale={iconScale}
          width={18}
          height={18}
          stroke="currentcolor"
          name={loading ? 'spinner' : icon}
        />
      </span>
    {/if}
    <slot />
    {#if count > 0}
      <Badge
        class="badge absolute top-0 right-0 translate-y-[-10px] translate-x-[10px] origin-bottom-left origin-bottom-left"
        type="count">{count}</Badge
      >
    {/if}
  </button>
{:else}
  <a
    {href}
    on:click
    class={`button primary ${classes}`}
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
    {#if icon || loading}
      <span class:animate-spin={loading}>
        <Icon
          scale={iconScale}
          width={18}
          height={18}
          stroke="currentcolor"
          name={loading ? 'spinner' : icon}
        />
      </span>
    {/if}
    <slot />
  </a>
{/if}

<style lang="postcss">
  .button {
    @apply border transition-colors py-2 px-4 relative flex w-fit items-center justify-center gap-2 font-poppins text-sm;
  }

  .button:disabled {
    @apply cursor-not-allowed;
  }

  .large {
    @apply text-lg;
  }

  .primary {
    @apply rounded bg-primary border-primary text-white;
  }

  .primary:disabled {
    @apply opacity-50;
  }

  .primary:hover:enabled {
    @apply bg-blue-700 border-blue-700;
  }

  .primary:hover:enabled :global(.badge) {
    @apply bg-blue-500 text-gray-100;
  }

  .secondary {
    @apply border-gray-800 bg-white text-gray-800;
  }

  .secondary:disabled {
    @apply bg-gray-300 text-gray-900;
  }

  .secondary:hover:enabled {
    @apply bg-gray-900 border-gray-900 text-white;
  }

  .destroy {
    @apply bg-danger border-danger px-5 text-white;
  }

  .destroy:disabled {
    @apply bg-red-300 text-red-900 border-red-900;
  }

  .destroy:hover:enabled {
    @apply bg-red-900 border-red-900 text-white;
  }

  .selected {
    @apply bg-purple-600 text-white;
  }

  .login {
    @apply mx-auto bg-gray-900 py-4;
  }

  .thin {
    @apply py-1;
  }
</style>
