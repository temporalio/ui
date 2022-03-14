<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ url }) {
    return {
      status: 302,
      redirect: `${url.pathname}/summary`,
    };
  };
</script>
