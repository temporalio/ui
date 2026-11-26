<script lang="ts">
  import type { Snippet } from 'svelte';

  import ErrorComponent from '$lib/holocene/error.svelte';
  import type { DescribeNamespaceResponse } from '$lib/types';
  import { namespaceCapabilityState } from '$lib/utilities/namespace-capabilities';

  interface Props {
    namespace: DescribeNamespaceResponse;
    children: Snippet;
    fallback?: Snippet;
  }

  let { namespace, children, fallback }: Props = $props();

  const capabilityState = $derived(
    namespaceCapabilityState(
      namespace?.namespaceInfo?.capabilities ?? undefined,
      'standaloneNexusOperation',
    ),
  );
</script>

{#if capabilityState === 'unsupported'}
  <ErrorComponent error={new Error('Not found')} status={404} />
{:else if capabilityState === 'enabled'}
  {@render children()}
{:else if fallback}
  {@render fallback()}
{/if}
