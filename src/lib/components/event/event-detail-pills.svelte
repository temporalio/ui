<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import {
    attributeGroupingProperties,
    AttributeGrouping,
  } from './_format-attributes';
  import Pill from '$lib/components/pill.svelte';

  export let attributeGrouping: AttributeGrouping;
  export let activePill: string;

  const dispatch = createEventDispatcher();
</script>

<div class="p-2 text-center xl:text-left">
  <div class="pill-container">
    {#each Object.entries(attributeGrouping) as [key, value] (key)}
      {#if value.length}
        <Pill
          active={activePill === key}
          on:click={() => dispatch('pillChange', { key })}
          color={attributeGroupingProperties[key].color}
          >{attributeGroupingProperties[key].label}</Pill
        >
      {/if}
    {/each}
  </div>
</div>

<style lang="postcss">
  .pill-container {
    @apply inline-flex gap-2 items-center justify-start flex-col md:flex-row px-2 py-2 rounded-md md:rounded-full bg-gray-100;
  }
</style>
