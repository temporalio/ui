<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { Payload } from '$lib/types';
  import { decodeUserMetadata } from '$lib/utilities/decode-payload';

  let {
    value,
    fallback = '',
    prefix = '',
    onDecode,
    children,
  }: {
    value?: Payload;
    fallback?: string;
    prefix?: string;
    onDecode?: (decodedValue: string) => void;
    children?: Snippet<[string]>;
  } = $props();

  const maxLength = 120;

  let decodedValue = '';

  const setPrefix = (metadata: string) => {
    if (prefix) {
      metadata = `${prefix} • ${metadata}`;
      if (metadata.length < maxLength) return metadata;
      return metadata.slice(0, maxLength) + '...';
    }
    return metadata;
  };

  const decodePayload = $derived(async (_value: Payload | undefined) => {
    if (!_value) return fallback;
    if (decodedValue) return decodedValue;

    const metadata = await decodeUserMetadata(_value);

    if (typeof metadata === 'string') {
      decodedValue = setPrefix(metadata);
      onDecode?.(decodedValue);
      return decodedValue;
    }

    decodedValue = fallback;
    return fallback;
  });
</script>

{#await decodePayload(value) then metadata}
  {@render children?.(metadata)}
{:catch}
  {@render children?.(fallback)}
{/await}
