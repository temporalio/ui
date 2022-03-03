<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ params }) {
    const { namespace } = params;
    return { status: 302, redirect: `/namespaces/${namespace}/workflows` };
  };
</script>
