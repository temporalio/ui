<script lang="ts">
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import PayloadInline from '$lib/components/payload/payload-inline.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isRawPayload, isRawPayloads } from '$lib/utilities/decode-payload';
  import { format } from '$lib/utilities/format-camel-case';
  import type { CombinedAttributes } from '$lib/utilities/format-event-attributes';
  import {
    displayLinkType,
    formatSummaryAttributeDisplayValue,
    type SummaryAttribute,
  } from '$lib/utilities/get-single-attribute-for-event';

  import EventDetailsLink from './event-details-link.svelte';

  interface Props {
    key: string;
    value: SummaryAttribute['value'] | number | boolean | null;
    attributes: CombinedAttributes;
    showKey?: boolean;
    class?: ClassNameValue;
  }

  let {
    key,
    value,
    attributes,
    showKey = true,
    class: className = '',
  }: Props = $props();

  const linkType = $derived(displayLinkType(key, attributes));
</script>

{#if key}
  <div
    class="flex max-w-xl items-center gap-2 first:pt-0 last:border-b-0 md:w-auto"
  >
    {#if showKey}
      <p class="text-right text-xs whitespace-nowrap">
        {format(key)}
      </p>
    {/if}
    {#if isRawPayload(value) || isRawPayloads(value)}
      <div
        class="flex max-w-sm items-center justify-between gap-2 overflow-hidden pr-1 xl:flex-nowrap"
      >
        <PayloadInline {value} class={merge(className)} />
      </div>
    {:else if typeof value === 'string' && linkType !== 'none'}
      <Copyable
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
        content={value}
        container-class="truncate"
      >
        <EventDetailsLink
          {value}
          {attributes}
          type={linkType}
          class="truncate"
        />
      </Copyable>
    {:else}
      <Badge type="subtle" class="block truncate select-none">
        {formatSummaryAttributeDisplayValue(value)}
      </Badge>
    {/if}
  </div>
{/if}
