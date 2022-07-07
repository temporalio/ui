<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  import { routeForEventHistory } from '$lib/utilities/route-for';
  import { eventViewType, eventSortOrder } from '$lib/stores/event-view';
  import { title } from '$lib/stores/page';

  const { namespace, workflow, run } = $page.params;

  $title = `Workflow History | ${workflow}`;

  onMount(async () => {
    const queryParams = {
      sort: $eventSortOrder,
    };

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
