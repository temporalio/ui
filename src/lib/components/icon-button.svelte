<script lang="ts">
  import Icon from '$lib/holocene/icon/index.svelte';

  import type { IconName } from '$lib/holocene/icon/paths';

  export let icon: IconName;
  export let scale = 1;
  export let classes: string = '';
</script>

<button class="icon-button" on:click data-cy={$$props.dataCy}>
  {#if icon}
    <div class="flex items-center gap-2 {classes}">
      <Icon class="h-4" stroke="white" name={icon} {scale} />
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
