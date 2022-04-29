<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  import { eventViewType } from '$lib/stores/event-views';
  import { routeForEventHistory } from '$lib/utilities/route-for';
  import { eventFilterSort } from '$lib/stores/event-filters';

  const { namespace, workflow, run } = $page.params;

  onMount(async () => {
    const queryParams =
      $eventFilterSort === 'reverse' ? { sort: 'reverse' } : undefined;
    goto(
      routeForEventHistory({
        view: $eventViewType,
        queryParams,
        namespace,
        workflow,
        run,
      }),
      {
        replaceState: true,
      },
    );
  });
</script>
