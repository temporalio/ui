<script lang="ts">
  import { type Snippet, untrack } from 'svelte';

  import type { Payload } from '$lib/types';
  import { decodePayloadAndParseDataToJSON } from '$lib/utilities/decode-payload';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  interface Props {
    value: Payload | null | undefined;
    fallback?: string;
    prefix?: string;
    class?: string;
    children?: Snippet<[decodedValue: string]>;
  }

  let {
    value,
    fallback = '',
    prefix = '',
    class: className = '',
    children,
  }: Props = $props();

  let decodedValue = $state(fallback);

  const decodeValue = (_value: Payload | null | undefined): Promise<string> => {
    if (!_value) return Promise.resolve(fallback);

    return decodePayloadAndParseDataToJSON(_value).then((result) => {
      if (typeof result !== 'string' || !result) return fallback;
      return prefix ? `${prefix} • ${result}` : result;
    });
  };

  const valueJson = $derived(stringifyWithBigInt(value));
  const decodePromise = $derived.by(() => {
    void valueJson;
    void prefix;
    void fallback;
    return decodeValue(untrack(() => value));
  });

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
  <span
    class="inline-block max-w-full truncate rounded-sm border border-primary bg-surface-secondary px-1.5 py-0.5 text-secondary"
  >
    {decodedValue || fallback}
  </span>
{/if}
