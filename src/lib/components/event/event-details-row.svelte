<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import Badge from '$lib/holocene/badge.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Payloads } from '$lib/types';
  import { format } from '$lib/utilities/format-camel-case';
  import type { CombinedAttributes } from '$lib/utilities/format-event-attributes';
  import { displayLinkType } from '$lib/utilities/get-single-attribute-for-event';

  import EventDetailsLink from './event-details-link.svelte';
  import PayloadDecoder from './payload-decoder.svelte';

  export let key: string;
  export let value: string | Record<string, unknown> | Payloads;
  export let attributes: CombinedAttributes;
  export let showKey = true;

  $: linkType = displayLinkType(key, attributes);
</script>

{#if key}
  <div
    class="flex max-w-xl items-center gap-2 first:pt-0 last:border-b-0 md:w-auto"
  >
    {#if showKey}
      <p class="whitespace-nowrap text-right text-xs">
        {format(key)}
      </p>
    {/if}
    {#if typeof value === 'object'}
      <div
        class="flex max-w-sm items-center justify-between gap-2 overflow-hidden pr-1 xl:flex-nowrap"
      >
        <PayloadDecoder {value} key="payloads">
          {#snippet children(decodedValue)}
            <div class={merge('payload', $$props.class)}>
              <code>
                <pre class="truncate">{decodedValue.slice(0, 60)}</pre>
              </code>
            </div>
          {/snippet}
        </PayloadDecoder>
      </div>
    {:else if linkType !== 'none'}
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
      <Badge type="subtle" class="block select-none truncate">
        {value}
      </Badge>
    {/if}
  </div>
{/if}

<style lang="postcss">
  .payload {
    @apply overflow-hidden border border-subtle bg-code-block px-1 py-0.5 font-mono text-xs;
  }

  .payload code {
    @apply text-primary;
  }

  .payload pre {
    @apply text-primary;
  }
</style>
