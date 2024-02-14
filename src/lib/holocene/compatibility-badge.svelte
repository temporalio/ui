<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';

  export let defaultVersion = false;
  export let active = false;
  export let buildId = '';
</script>

<p class="flex select-all gap-2 font-mono">
  {#if defaultVersion && buildId}
    <span class:active-version={active} class:version={!active}>
      <Icon name="merge" />{buildId}
      <slot name="overall-default-worker" />
      <slot name="default-worker" />
    </span>
  {:else if buildId}
    <span class="version">
      <Icon name="merge" />{buildId}
    </span>
  {/if}
</p>

<style lang="postcss">
  .version {
    @apply flex items-center gap-1 rounded border  px-1 text-sm;
  }

  .active-version {
    @apply flex items-center gap-1 rounded bg-green-100 px-1 text-sm text-green-700;
  }
</style>
