<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ url, stuff }) {
    const [firstEvent] = stuff.events;

    return { status: 302, redirect: `${url.pathname}/${firstEvent.id}` };
  };
</script>
