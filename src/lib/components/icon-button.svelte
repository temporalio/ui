<script lang="ts">
  import Icon from 'holocene/components/icon/index.svelte';

  import type { IconName } from 'holocene/components/icon/paths';

  export let icon: IconName;
  export let scale = 1;
  export let classes: string = '';
</script>

<button class="icon-button" on:click data-cy={$$props.dataCy}>
  {#if icon}
    <div class="flex items-center gap-2 {classes}">
      <Icon name={icon} {scale} />
      <slot />
    </div>
  {:else}
    <slot />
  {/if}
</button>

<style lang="postcss">
  .icon-button {
    @apply inline-block h-8 w-8 p-1 text-sm;
  }
</style>
