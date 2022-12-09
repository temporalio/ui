<script context="module" lang="ts">
  import { routeForEventHistory } from '$lib/utilities/route-for';
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ params }) {
    const { namespace, workflow, run } = params;
    const route = routeForEventHistory({
      namespace,
      workflow,
      run,
    });
    return { status: 302, redirect: route };
  };
</script>
