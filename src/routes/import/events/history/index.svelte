<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import { routeForImport } from '$lib/utilities/route-for';

  export const load: Load = async function () {
    const redirect = routeForImport({ importType: 'events', view: 'summary' });
    return { status: 302, redirect };
  };
</script>
