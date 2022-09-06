<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';

  import type { IconName } from '$lib/holocene/icon/paths';

  export let icon: IconName = null;
  export let classes: string = '';
  export let type = 'button';
</script>

<button class="icon-button" on:click data-cy={$$props.dataCy} {type}>
  {#if icon}
    <div class="flex items-center justify-center gap-2 {classes}">
      <Icon class="h-4" name={icon} />
      <slot />
    </div>
  {:else}
    <slot />
  {/if}
</button>

<style lang="postcss">
  .icon-button {
    @apply inline-block h-8 w-8 text-sm;
  }
</style>
