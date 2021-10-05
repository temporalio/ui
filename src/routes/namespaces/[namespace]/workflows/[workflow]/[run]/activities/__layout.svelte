<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ page }: LoadInput) {
    const { workflow: executionId, run: runId, namespace } = page.params;

    return {
      props: {
        executionId,
        runId,
        namespace,
      },
    };
  }
</script>

<script lang="ts">
  import { page } from '$app/stores';
  import { createEventStore } from '$lib/stores/events';
  import { pathMatches } from '$lib/utilities/path-matches';
  import { getActivityUrl } from '$lib/utilities/get-activity-url';

  export let namespace: string;
  export let executionId: string;
  export let runId: string;

  const { activities } = createEventStore(namespace, executionId, runId);
  $: urlFor = getActivityUrl(namespace, executionId, runId);
  $: isActive = (id: string) => pathMatches(urlFor(id), $page.path);
</script>

<section class="flex min-h-full">
  <div class="w-1/3 flex-1">
    {#each $activities as activity}
      <a class:active={isActive(activity.id)} href={urlFor(activity.id)}>
        <article class="p-4 m-4 border-2">
          <h2>Activity {activity.id}: {activity.status}</h2>
        </article>
      </a>
    {/each}
  </div>
  <div class="w-2/3">
    <slot />
  </div>
</section>

<style lang="postcss">
  .active > article {
    @apply bg-yellow-100 border-yellow-500;
  }
</style>
