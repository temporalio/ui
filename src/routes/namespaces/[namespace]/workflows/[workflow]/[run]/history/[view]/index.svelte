<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import { getFirstId } from './_get-first-id';
  import { getEventsOrGroupsBasedOnParams } from './_get-events-or-groups-based-on-params';

  export const load: Load = async function ({ url, stuff, params }) {
    const items = getEventsOrGroupsBasedOnParams({ params, stuff });
    const firstMatchingEventId = getFirstId(items);

    if (stuff.matchingEvents.length && firstMatchingEventId) {
      return {
        status: 302,
        redirect: `${url.pathname}/${firstMatchingEventId}`,
      };
    }

    return {};
  };
</script>
