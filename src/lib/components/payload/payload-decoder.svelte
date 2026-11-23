<script lang="ts">
  import type { Snippet } from 'svelte';

  import { createDecodedPayload } from '$lib/runes/decoded-payload.svelte';
  import type { Payload, Payloads } from '$lib/types';
  import type { PayloadContainingObject } from '$lib/utilities/decode-payload';
  import type { DecodedPayloadResult } from '$lib/utilities/decode-payload-result';

  type T = $$Generic<PayloadContainingObject>;

  type Props = {
    value: Payload | Payloads | T;
    children: Snippet<[DecodedPayloadResult]>;
    onDecode?: (result: DecodedPayloadResult) => void;
    loading?: Snippet<[]>;
    error?: Snippet<[{ error: unknown; retry: () => void }]>;
  };

  let { value, children, onDecode, loading, error }: Props = $props();

  const decoded = createDecodedPayload(() => value, {
    onDecode: (result) => onDecode?.(result),
  });
</script>

{#if decoded.current.status === 'success'}
  {@render children(decoded.current.results)}
{:else if decoded.current.status === 'error'}
  {@render error?.({
    error: decoded.current.error,
    retry: decoded.current.retry,
  })}
{:else if decoded.current.status === 'loading'}
  {@render loading?.()}
{/if}
