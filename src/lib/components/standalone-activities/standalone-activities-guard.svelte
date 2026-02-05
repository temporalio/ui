<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { DescribeNamespaceResponse } from '$lib/types';

  interface Props {
    namespace: DescribeNamespaceResponse;
    children: Snippet;
    fallback?: Snippet;
  }

  let { namespace, children, fallback }: Props = $props();
</script>

{#if namespace.namespaceInfo?.capabilities?.standaloneActivities}
  {@render children()}
{:else if fallback}
  {@render fallback()}
{/if}
