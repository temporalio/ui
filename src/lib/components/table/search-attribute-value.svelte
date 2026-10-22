<script lang="ts">
  import Timestamp from '$lib/components/timestamp.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { Badge } from '$lib/io/badge';
  import {
    SEARCH_ATTRIBUTE_TYPE,
    type SearchAttributeType,
  } from '$lib/types/workflows';
  import {
    TRUNCATE_LENGTH,
    truncateValue,
  } from '$lib/utilities/truncate-value';

  type Props = {
    value: unknown;
    type?: SearchAttributeType;
    truncate?: boolean;
  };

  let { value, type, truncate = false }: Props = $props();

  const displayValue = $derived(
    Array.isArray(value) ? value.join(', ') : String(value),
  );
  const hideTooltip = $derived(
    !truncate || truncateValue(displayValue).length <= TRUNCATE_LENGTH,
  );
</script>

{#if value != null}
  {#if type === SEARCH_ATTRIBUTE_TYPE.DATETIME && typeof value === 'string'}
    <Timestamp dateTime={value} />
  {:else if type === SEARCH_ATTRIBUTE_TYPE.BOOL}
    <Badge text={displayValue} />
  {:else}
    <Tooltip
      usePortal
      text={displayValue}
      top
      class="min-w-0"
      hide={hideTooltip}
    >
      {truncate ? truncateValue(displayValue) : displayValue}
    </Tooltip>
  {/if}
{/if}
