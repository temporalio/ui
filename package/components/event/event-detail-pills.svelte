<script>import { createEventDispatcher } from 'svelte';
import { attributeGroupingProperties, } from '../../utilities/format-event-attributes';
import Pill from '../pill.svelte';
export let attributeGrouping;
export let activePill;
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

<style>
  .pill-container {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 0.5rem;
    border-radius: 0.375rem;
    --tw-bg-opacity: 1;
    background-color: rgb(244 244 245 / var(--tw-bg-opacity));
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem
}
@media (min-width: 768px) {
    .pill-container {
        flex-direction: row;
        border-radius: 9999px
    }
}</style>
