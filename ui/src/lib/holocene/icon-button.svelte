<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';

  import type { IconName } from '$lib/holocene/icon/paths';

  export let icon: IconName = null;
  export let classes: string = '';
  export let type: 'button' | 'submit' | 'reset' = 'button';
</script>

<button class="icon-button" on:click data-cy={$$props.dataCy} {type}>
  {#if icon}
    <div class="flex items-center justify-center gap-2 {classes}">
      <Icon name={icon} />
      <slot />
    </div>
  {:else}
    <slot />
  {/if}
</button>

<style lang="postcss">
  .icon-button {
    @apply inline-block w-auto text-sm;
  }
</style>
