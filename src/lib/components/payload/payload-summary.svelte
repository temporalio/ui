<script lang="ts">
  import { onMount, type Snippet } from 'svelte';

  import Badge from '$lib/holocene/badge.svelte';
  import type { Payload as RawPayload } from '$lib/types';
  import type { Payload } from '$lib/types/events';
  import {
    decodeEventAttributes,
    type PotentiallyDecodable,
  } from '$lib/utilities/decode-payload';

  interface Props {
    value: RawPayload | Payload | null | undefined;
    fallback?: string;
    prefix?: string;
    maxSummaryLength?: number;
    class?: string;
    children?: Snippet<[decodedValue: string]>;
  }

  let {
    value,
    fallback = '',
    prefix = '',
    maxSummaryLength = 120,
    class: className = '',
    children,
  }: Props = $props();

  let decodedValue = $state(fallback);

  const applyPrefix = (text: string): string => {
    if (!prefix) return text;
    const prefixed = `${prefix} • ${text}`;
    if (prefixed.length <= maxSummaryLength) return prefixed;
    return prefixed.slice(0, maxSummaryLength) + '...';
  };

  onMount(async () => {
    if (!value) {
      decodedValue = fallback;
      return;
    }
    try {
      const result = await decodeEventAttributes(value as PotentiallyDecodable);
      if (typeof result === 'string' && result) {
        decodedValue = applyPrefix(result);
      } else {
        decodedValue = fallback;
      }
    } catch {
      decodedValue = fallback;
    }
  });
</script>

{#if children}
  {@render children(decodedValue)}
{:else if className}
  <span class={className}>{decodedValue || fallback}</span>
{:else}
  <Badge type="secondary">{decodedValue || fallback}</Badge>
{/if}
