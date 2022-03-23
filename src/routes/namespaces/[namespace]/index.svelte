<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit';

  import { routeForWorkflows } from '$lib/utilities/route-for';
  import { getNamespace } from '$lib/utilities/get-namespace';

  export const load: Load = async ({ stuff }) => {
    const namespaces = stuff.namespaces;
    const defaultNamespace = stuff?.settings?.defaultNamespace;

    const namespace = getNamespace({ namespaces, defaultNamespace });
    const redirect = routeForWorkflows({
      namespace,
    });

    return {
      status: 302,
      redirect,
    };
  };
</script>
