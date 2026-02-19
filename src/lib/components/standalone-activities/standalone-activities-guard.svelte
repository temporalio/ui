<script lang="ts">
  import type { Snippet } from 'svelte';

  import { temporalVersion } from '$lib/stores/versions';
  import type { DescribeNamespaceResponse } from '$lib/types';
  import { minimumVersionRequired } from '$lib/utilities/version-check';

  interface Props {
    namespace: DescribeNamespaceResponse;
    children: Snippet;
    fallback?: Snippet;
  }

  let { namespace, children, fallback }: Props = $props();
</script>

{#if namespace.namespaceInfo?.capabilities?.standaloneActivities && minimumVersionRequired('1.30.0', $temporalVersion)}
  {@render children()}
{:else if fallback}
  {@render fallback()}
{/if}
