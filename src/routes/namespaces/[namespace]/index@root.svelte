<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit';

  import { routeForWorkflows } from '$lib/utilities/route-for';
  import { getNamespace } from '$lib/utilities/get-namespace';

  export const load: Load = async ({ stuff, params }) => {
    const namespaces = stuff.namespaces;
    const defaultNamespace = stuff?.settings?.defaultNamespace;

    const namespace = getNamespace({
      namespace: params.namespace,
      namespaces,
      defaultNamespace,
    });

    if (namespace) {
      const redirect = routeForWorkflows({
        namespace,
      });

      return {
        status: 302,
        redirect,
      };
    }

    return {
      error: `Namespace ${params.namespace} does not exist`,
      status: 404,
    };
  };
</script>
