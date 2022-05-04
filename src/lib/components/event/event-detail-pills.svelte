<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import {
    attributeGroupingProperties,
    AttributeGrouping,
    AttributeGroup,
  } from './_format-attributes';
  import Pill from '$lib/components/pill.svelte';

  export let attributeGrouping: AttributeGrouping;
  export let activePill: AttributeGroup;

  const dispatch = createEventDispatcher();
</script>

<div class="pill-container">
  {#each Object.keys(attributeGrouping) as key (key)}
    <Pill
      active={activePill === key}
      on:click={() => dispatch('pillChange', { key })}
      color={attributeGroupingProperties[key].color}
      >{attributeGroupingProperties[key].label}</Pill
    >
  {/each}
</div>

<style lang="postcss">
  .pill-container {
    @apply flex items-center justify-start flex-col md:flex-row gap-4 px-8 py-4;
  }
</style>
