<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import { getFirstId } from '../_get-first-id';

  export const load: Load = async function ({ url, stuff }) {
    return {
      status: 302,
      redirect: `${url.pathname}/${getFirstId(stuff.eventGroups)}`,
    };
  };
</script>
