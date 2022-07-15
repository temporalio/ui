<script lang="ts">
  import Icon from '$holocene/icon/index.svelte';
  import type { IconName } from '$holocene/icon/paths';
  import Badge from '$holocene/badge.svelte';

  export let disabled: boolean = false;
  export let variant:
    | 'primary'
    | 'secondary'
    | 'destructive'
    | 'login'
    | 'link' = 'primary';

  export let thin: boolean = false;
  export let loading: boolean = false;
  export let href: string = null;
  export let target: '_self' | '_external' = '_self';
  export let active: boolean = false;
  export let large: boolean = false;
  export let as: 'button' | 'anchor' = href ? 'anchor' : 'button';
  export let icon: IconName = '';
  export let iconScale: number = 1;
  export let classes: string = $$props.class;
  export let dataCy: string = $$props.dataCy;
  export let count: number = 0;
  export let type: string = 'button';
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
        <Icon
          scale={iconScale}
          stroke="currentcolor"
          name={loading ? 'spinner' : icon}
        />
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
    @apply rounded relative flex w-fit items-center justify-center gap-2 font-secondary text-sm;
  }

  .primary,
  .secondary,
  .destructive,
  .login {
    @apply border py-2 px-4 transition-colors;
  }

  .button:disabled {
    @apply cursor-not-allowed;
  }

  .large {
    @apply text-lg;
  }

  .primary {
    @apply border-primary bg-primary text-white;
  }

  .primary:disabled {
    @apply opacity-50;
  }

  .primary:hover:enabled {
    @apply border-blue-700 bg-blue-700;
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
    @apply border-gray-900 bg-gray-900 text-white;
  }

  .destructive {
    @apply border-danger bg-danger px-5 text-white;
  }

  .destructive:disabled {
    @apply border-red-900 bg-red-300 text-red-900;
  }

  .destructive:hover:enabled {
    @apply border-red-900 bg-red-900 text-white;
  }

  .link {
    @apply bg-none border-0 p-0 text-sm shadow-none underline font-primary;
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

  .ghost {
    @apply bg-white border-0 p-0 text-sm shadow-none;
  }
</style>
