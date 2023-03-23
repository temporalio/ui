<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';
  import Badge from '$lib/holocene/badge.svelte';

  export let disabled: boolean = false;
  export let loading: boolean = false;
  export let count: number = 0;
  export let active: boolean = false;
  export let primary: boolean = false;
  export let add: boolean = false;
  export let destructive: boolean = false;
  export let icon: IconName = null;
  export let iconClass: string = null;
  export let testId: string = $$props.testId;
  export let unround: boolean = false;
  export let unroundRight: boolean = false;
  export let unroundLeft: boolean = false;
</script>

<button
  on:click
  class="button rounded {$$props.class}"
  class:active
  class:primary
  class:destructive
  data-testid={testId}
  {disabled}
  class:disabled
  class:add
  class:unround
  class:unroundRight
  class:unroundLeft
>
  {#if icon || loading}
    <span class:animate-spin={loading}>
      <Icon name={loading ? 'spinner' : icon} class={iconClass} />
    </span>
  {/if}
  <slot />
  {#if count > 0}
    <Badge
      class="badge absolute top-0 right-0 z-20 origin-bottom-left translate-y-[-10px] translate-x-[10px]"
      type="count">{count}</Badge
    >
  {/if}
</button>

<style lang="postcss">
  .button {
    @apply relative flex w-fit items-center justify-center gap-2 border-2 border-primary bg-white px-2 py-1 font-secondary text-sm transition hover:bg-primary hover:text-white;
  }

  .disabled {
    @apply cursor-not-allowed bg-gray-100  hover:bg-gray-100 hover:text-primary;
  }

  .destructive {
    @apply border-danger bg-danger text-white hover:border-red-900 hover:bg-red-900;
  }

  .active {
    @apply bg-primary text-white;
  }

  .primary {
    @apply bg-primary from-blue-100 to-purple-200 text-white hover:bg-gradient-to-r hover:text-primary;
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
