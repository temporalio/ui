<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import { routeForLoginPage } from '$lib/utilities/route-for';

  export const load: Load = async function ({ error }) {
    return {
      status: 302,
      redirect: routeForLoginPage(error.message),
    };
  };
</script>
