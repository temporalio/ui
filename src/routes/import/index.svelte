<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit';

  import { routeForImport } from '$lib/utilities/route-for';

  export const load: Load = async () => {
    const redirect = routeForImport({ importType: 'events' });

    return {
      status: 302,
      redirect,
    };
  };
</script>
