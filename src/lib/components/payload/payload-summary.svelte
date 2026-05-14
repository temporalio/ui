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

  const decodePromise = $derived(
    (() => {
      const _value = value;
      const _fallback = fallback;
      const _prefix = prefix;
      const _max = maxSummaryLength;

      if (!_value) return Promise.resolve(_fallback);

      return decodePayloadAndParseDataToJSON(_value).then((result) => {
        if (typeof result !== 'string' || !result) return _fallback;
        if (!_prefix) return result;
        const prefixed = `${_prefix} • ${result}`;
        return prefixed.length <= _max
          ? prefixed
          : prefixed.slice(0, _max) + '...';
      });
    })(),
  );

  $effect(() => {
    let cancelled = false;
    decodePromise
      .then((result) => {
        if (!cancelled) decodedValue = result;
      })
      .catch(() => {
        if (!cancelled) decodedValue = fallback;
      });
    return () => {
      cancelled = true;
    };
  });
</script>

{#if children}
  {@render children(decodedValue)}
{:else if className}
  <span class={className}>{decodedValue || fallback}</span>
{:else}
  <Badge type="secondary">{decodedValue || fallback}</Badge>
{/if}
