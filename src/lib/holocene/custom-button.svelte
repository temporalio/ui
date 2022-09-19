<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';
  import type { IconName } from '$holocene/icon/paths';

  export let disabled: boolean = false;
  export let loading: boolean = false;
  export let active: boolean = false;
  export let add: boolean = false;
  export let remove: boolean = false;
  export let icon: IconName = null;
  export let iconClass: string = null;
  export let dataCy: string = $$props.dataCy;
</script>

<button
  on:click
  class="button {$$props.class}"
  class:active
  data-cy={dataCy}
  {disabled}
  class:add
  class:remove
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
    @apply relative flex w-fit items-center justify-center gap-2 rounded font-secondary text-sm transition px-2 py-1 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-400;
  }

  .active {
    @apply bg-black text-white;
  }

  .add {
    @apply hover:bg-green-400 hover:border-green-400;
  }

  .remove {
    @apply hover:bg-red-700 hover:border-red-700 hover:text-white;
  }
</style>
