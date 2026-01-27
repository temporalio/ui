<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import StandaloneActivitiesDisabled from '$lib/components/activity-execution/standalone-activities-disabled.svelte';
  import StandaloneActivitiesGuard from '$lib/components/activity-execution/standalone-activities-guard.svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<StandaloneActivitiesGuard namespace={page.data.namespace}>
  {@render children()}
  {#snippet fallback()}
    <StandaloneActivitiesDisabled namespace={page.params.namespace} />
  {/snippet}
</StandaloneActivitiesGuard>
