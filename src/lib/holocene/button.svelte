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
    @apply relative flex w-fit items-center justify-center gap-2 rounded font-secondary text-sm;
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

  .primary,
  .login {
    @apply border-primary bg-primary text-white hover:bg-blue-500 hover:text-gray-100;
  }

  .primary:disabled {
    @apply opacity-50 hover:bg-primary hover:border-primary;
  }

  .primary:hover {
    @apply border-blue-700 bg-blue-700;
  }

  .secondary {
    @apply border-gray-800 bg-white text-gray-800 hover:border-primary hover:bg-primary hover:text-white;
  }

  .secondary:disabled {
    @apply opacity-50 hover:bg-white hover:border-gray-800 hover:text-gray-800;
  }

  .destructive {
    @apply border-danger bg-danger px-5 text-white hover:border-red-900 hover:bg-red-900;
  }

  .destructive:disabled {
    @apply opacity-50 hover:border-danger hover:bg-danger;
  }

  .link {
    @apply border-0 bg-none p-0 font-primary text-sm underline shadow-none;
  }

  .selected {
    @apply bg-purple-600 text-white;
  }

  .login {
    @apply mx-auto;
  }

  .thin {
    @apply py-1;
  }
</style>
