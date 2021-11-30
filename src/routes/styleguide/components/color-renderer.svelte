<script lang="ts">
  // This should be a circular reference but am Lazy and couldn't get it working
  type ColorValues = { [key: string]: string | ColorValues };

  export let colors: ColorValues;

  import ColorBox from './color-box.svelte';
</script>

{#if colors}
  {#each Object.entries(colors) as [colorNames, colorValues]}
    {#if typeof colorValues === 'object'}
      <div class="mb-20">
        <h3 class="text-2xl capitalize space-y-6">{colorNames}</h3>
        <div class="grid-cols-5 grid gap-2 ">
          <svelte:self colors={colorValues} />
        </div>
      </div>
    {:else}
      <ColorBox name={colorNames} hexColor={colorValues} />
    {/if}
  {/each}
{/if}

<style></style>
