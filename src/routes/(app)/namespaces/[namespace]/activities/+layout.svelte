<script lang="ts">
  import { page } from '$app/state';

  import type { LayoutProps } from './$types';

  import StandaloneActivitiesDisabled from '$lib/components/standalone-activities/standalone-activities-disabled.svelte';
  import StandaloneActivitiesGuard from '$lib/components/standalone-activities/standalone-activities-guard.svelte';

  let { children }: LayoutProps = $props();
</script>

<StandaloneActivitiesGuard namespace={page.data.namespace}>
  {@render children()}
  {#snippet fallback()}
    <StandaloneActivitiesDisabled
      href={page.url.href}
      namespace={page.params.namespace}
    />
  {/snippet}
</StandaloneActivitiesGuard>
