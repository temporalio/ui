<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { attributeGroupingProperties } from '$lib/utilities/format-event-attributes';
  import type { AttributeGrouping } from '$lib/utilities/format-event-attributes';
  import Pill from '$lib/components/pill.svelte';
  import { translate } from '$lib/i18n/translate';

  export let attributeGrouping: AttributeGrouping;
  export let activePill: string;

  const dispatch = createEventDispatcher();

  $: pillCount = Object.values(attributeGrouping).reduce((count, value) => {
    if (value.length) {
      count += 1;
    }
    return count;
  }, 0);
</script>

{#if pillCount > 1}
  <div class="p-2 text-center xl:text-left">
    <div class="pill-container">
      {#each Object.entries(attributeGrouping) as [key, value] (key)}
        {@const active = activePill === key}
        {#if value.length}
          <Pill
            {active}
            on:click={() => dispatch('pillChange', { key })}
            color={active ? 'lightBlue' : 'gray'}
            >{translate('events', attributeGroupingProperties[key].label)}</Pill
          >
        {/if}
      {/each}
    </div>
  </div>
{/if}

<style lang="postcss">
  .pill-container {
    @apply inline-flex flex-col items-center justify-start gap-2 rounded-md bg-gray-100 px-2 py-2 md:flex-row md:rounded-full;
  }
</style>
