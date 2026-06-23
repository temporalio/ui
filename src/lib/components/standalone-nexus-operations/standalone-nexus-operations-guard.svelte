<script lang="ts">
  import type { Snippet } from 'svelte';

  import type {
    DescribeNamespaceResponse,
    NamespaceCapabilities,
  } from '$lib/types';

  interface Props {
    namespace: DescribeNamespaceResponse;
    children: Snippet;
    fallback?: Snippet;
  }

  let { namespace, children, fallback }: Props = $props();
</script>

{#if (namespace.namespaceInfo?.capabilities as NamespaceCapabilities)?.standaloneNexusOperation}
  {@render children()}
{:else if fallback}
  {@render fallback()}
{/if}
