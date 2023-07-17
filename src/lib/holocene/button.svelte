<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';

  export let disabled = false;
  export let variant:
    | 'primary'
    | 'secondary'
    | 'destructive'
    | 'login'
    | 'link' = 'primary';

  export let thin = false;
  export let loading = false;
  export let href: string = null;
  export let target: '_self' | '_external' = '_self';
  export let active = false;
  export let large = false;
  export let as: 'button' | 'anchor' = href ? 'anchor' : 'button';
  export let icon: IconName = null;
  export let iconClass: string = null;
  export let classes: string = $$props.class;
  export let testId: string = $$props.testId;
  export let count = 0;
  export let type = 'button';
  export let unround = false;
  export let unroundRight = false;
  export let unroundLeft = false;
  export let id: string = null;
</script>

{#if as === 'button'}
  <button
    on:click|stopPropagation
    class="button {variant} {classes}"
    class:selected={active}
    class:large
    class:thin
    class:unround
    class:unroundRight
    class:unroundLeft
    data-testid={testId}
    {type}
    {disabled}
    {id}
  >
    {#if icon || loading}
      <span class:animate-spin={loading}>
        <Icon name={loading ? 'spinner' : icon} class={iconClass} />
      </span>
    {/if}
    <slot />
    {#if count > 0}
      <Badge
        class="badge absolute top-0 right-0 origin-bottom-left translate-y-[-10px] translate-x-[10px]"
        type="count">{count}</Badge
      >
    {/if}
  </button>
{:else}
  <a
    {href}
    on:click|stopPropagation
    class="button {variant} {classes}"
    class:selected={active}
    class:large
    class:disabled
    class:thin
    data-testid={testId}
    {target}
    {id}
  >
    {#if icon || loading}
      <span class:animate-spin={loading}>
        <Icon name={loading ? 'spinner' : icon} />
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
    @apply border-2 py-2 px-4 transition-colors;
  }

  .button:disabled {
    @apply cursor-not-allowed;
  }

  a.disabled {
    @apply pointer-events-none opacity-75 hover:border-gray-800 hover:bg-white hover:text-gray-800;
  }

  .large {
    @apply text-lg;
  }

  .primary,
  .login {
    @apply border-primary bg-primary bg-gradient-to-br text-white hover:from-blue-100 hover:to-purple-100 hover:text-primary;
  }

  .primary:disabled,
  .login:disabled {
    @apply text-white opacity-75 hover:from-primary hover:to-primary;
  }

  .secondary {
    @apply border-gray-800 bg-white text-gray-800 hover:border-primary hover:bg-primary hover:text-white;
  }

  .secondary:disabled {
    @apply opacity-75 hover:border-gray-800 hover:bg-white hover:text-gray-800;
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
    @apply bg-gradient-to-br from-blue-100 to-purple-100 text-gray-900;
  }

  .login {
    @apply mx-auto;
  }

  .thin {
    @apply h-8 py-1;
  }

  .unround {
    @apply rounded-none;
  }

  .unroundLeft {
    @apply rounded-tl-none rounded-bl-none;
  }

  .unroundRight {
    @apply rounded-tr-none rounded-br-none;
  }
</style>
