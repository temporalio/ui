<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';

  export let defaultVersion: boolean = false;
  export let active: boolean = false;
  export let buildId: string = '';
</script>

<p class="select-all flex gap-2 noto">
  {#if defaultVersion}
    <span class:active-version={active} class:version={!active}>
      <Icon name="merge" />{buildId}
      {#if active}Overall{/if} Default</span
    >
  {:else}
    <span class="version"><Icon name="merge" />{buildId}</span>
  {/if}
</p>

<style lang="postcss">
  .version {
    @apply px-1 flex gap-1 items-center border border-gray-900 rounded;
  }

  .active-version {
    @apply px-1 flex gap-1 items-center bg-green-100 text-green-700 rounded;
  }
</style>
