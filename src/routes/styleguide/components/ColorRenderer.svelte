<script lang="ts">
  // This should be a circular reference but am Lazy and couldn't get it working
  type ColorValues = Record<string, Record<string, string> | string>;

  export let colors: ColorValues;

  import ColorBox from './ColorBox.svelte';
</script>

{#if colors}
  {#each Object.entries(colors) as [colorNames, colorValues]}
    {#if typeof colorValues === 'object'}
      <h3 class="text-2xl capitalize space-y-6">{colorNames}</h3>
      <div class="grid-cols-5 grid gap-2 ">
        <svelte:self colors={colorValues} />
      </div>
    {:else}
      <ColorBox name={colorNames} hexColor={colorValues} />
    {/if}
  {/each}
{/if}

<style></style>
