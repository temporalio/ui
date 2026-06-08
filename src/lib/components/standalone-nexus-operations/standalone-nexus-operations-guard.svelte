<script lang="ts">
  import type { Snippet } from 'svelte';

  import { temporalVersion } from '$lib/stores/versions';
  import type {
    DescribeNamespaceResponse,
    NamespaceCapabilities,
  } from '$lib/types';
  import { minimumVersionRequired } from '$lib/utilities/version-check';

  interface Props {
    namespace: DescribeNamespaceResponse;
    children: Snippet;
    isCloud?: boolean;
    fallback?: Snippet;
  }

  let { namespace, children, isCloud = false, fallback }: Props = $props();
</script>

{#if (namespace.namespaceInfo?.capabilities as NamespaceCapabilities)?.standaloneNexusOperation && (isCloud || minimumVersionRequired('1.31.0', $temporalVersion))}
  {@render children()}
{:else if fallback}
  {@render fallback()}
{/if}
