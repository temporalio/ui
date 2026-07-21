<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { DescribeNamespaceResponse } from '$lib/types';

  interface Props {
    namespace: DescribeNamespaceResponse;
    children: Snippet;
  }

  let { namespace, children }: Props = $props();
</script>

{#if namespace?.namespaceInfo?.capabilities?.standaloneActivityStartDelay}
  {@render children()}
{/if}
