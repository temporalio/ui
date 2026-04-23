<script lang="ts">
  import { type Snippet } from 'svelte';

  import Badge from '$lib/holocene/badge.svelte';
  import type { Payload } from '$lib/types';
  import { decodePayloadAndParseDataToJSON } from '$lib/utilities/decode-payload';

  interface Props {
    value: Payload | null | undefined;
    fallback?: string;
    prefix?: string;
    maxSummaryLength?: number;
    class?: string;
    onDecode?: (decodedValue: string) => void;
    children?: Snippet<[decodedValue: string]>;
  }

  let {
    value,
    fallback = '',
    prefix = '',
    maxSummaryLength = 120,
    class: className = '',
    onDecode,
    children,
  }: Props = $props();

  let decodedValue = $state(fallback);

  const applyPrefix = (text: string): string => {
    if (!prefix) return text;
    const prefixed = `${prefix} • ${text}`;
    if (prefixed.length <= maxSummaryLength) return prefixed;
    return prefixed.slice(0, maxSummaryLength) + '...';
  };

  $effect(() => {
    if (!value) {
      decodedValue = fallback;
      return;
    }
    decodePayloadAndParseDataToJSON(value)
      .then((result) => {
        if (typeof result === 'string' && result) {
          decodedValue = applyPrefix(result);
          onDecode?.(decodedValue);
        } else {
          decodedValue = fallback;
        }
      })
      .catch(() => {
        decodedValue = fallback;
      });
  });
</script>

{#if children}
  {@render children(decodedValue)}
{:else if className}
  <span class={className}>{decodedValue || fallback}</span>
{:else}
  <Badge type="secondary">{decodedValue || fallback}</Badge>
{/if}
