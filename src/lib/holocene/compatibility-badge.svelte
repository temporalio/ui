<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';

  export let defaultVersion = false;
  export let active = false;
  export let buildId = '';
  export let unversionedText = 'Unversioned';
</script>

<p class="select-all flex gap-2 noto">
  {#if defaultVersion && buildId}
    <span class:active-version={active} class:version={!active}>
      <Icon name="merge" />{buildId}
      {#if active}Overall{/if} Default</span
    >
  {:else}
    <span class="version" class:unversioned={!buildId}>
      {#if buildId}
        <Icon name="merge" />{buildId}
      {:else}
        {unversionedText}
      {/if}
    </span>
  {/if}
</p>

<style lang="postcss">
  .version {
    @apply px-1 flex gap-1 items-center border border-gray-900 rounded text-sm;
  }

  .active-version {
    @apply px-1 flex gap-1 items-center bg-green-100 rounded text-green-700 text-sm;
  }

  .unversioned {
    @apply bg-gray-200 border-gray-200;
  }
</style>
