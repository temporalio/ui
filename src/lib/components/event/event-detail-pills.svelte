<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import PillContainer from '$lib/holocene/pill-container/pill-container.svelte';
  import Pill from '$lib/holocene/pill-container/pill.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { AttributeGrouping } from '$lib/utilities/format-event-attributes';
  import { attributeGroupingProperties } from '$lib/utilities/format-event-attributes';

  export let attributeGrouping: AttributeGrouping;

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
    <PillContainer>
      {#each Object.entries(attributeGrouping) as [key, value] (key)}
        {#if value.length}
          <Pill id={key} onClick={() => dispatch('pillChange', { key })}
            >{translate(attributeGroupingProperties[key].label)}</Pill
          >
        {/if}
      {/each}
    </PillContainer>
  </div>
{/if}

<style lang="postcss">
  .pill-container {
    @apply surface-subtle inline-flex flex-col items-center justify-start gap-2 rounded-md px-2 py-2 md:flex-row md:rounded-full;
  }
</style>
