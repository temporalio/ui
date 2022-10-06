<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';
  import type { IconName } from '$holocene/icon/paths';

  export let disabled: boolean = false;
  export let loading: boolean = false;
  export let active: boolean = false;
  export let primary: boolean = false;
  export let add: boolean = false;
  export let destructive: boolean = false;
  export let icon: IconName = null;
  export let iconClass: string = null;
  export let dataCy: string = $$props.dataCy;
  export let unround: boolean = false;
  export let unroundRight: boolean = false;
  export let unroundLeft: boolean = false;
</script>

<button
  on:click
  class="{$$props.class} button"
  class:active
  class:primary
  data-cy={dataCy}
  {disabled}
  class:disabled
  class:add
  class:destructive
  class:unround
  class:unroundRight
  class:unroundLeft
>
  <slot />
  {#if icon || loading}
    <span class:animate-spin={loading}>
      <Icon name={loading ? 'spinner' : icon} class={iconClass} />
    </span>
  {/if}
</button>

<style lang="postcss">
  .button {
    @apply relative flex w-fit items-center justify-center gap-2 px-2 py-1 font-secondary text-sm transition hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-200 hover:text-gray-900;
  }

  .disabled {
    @apply cursor-not-allowed bg-gray-100 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200;
  }

  .destructive {
    @apply hover:bg-gradient-to-r hover:from-red-100 hover:to-red-200;
  }

  .active {
    @apply bg-black text-white;
  }

  .primary {
    @apply bg-blue-700 text-white hover:from-gray-900 hover:to-gray-900 hover:text-white;
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
