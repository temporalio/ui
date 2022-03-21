<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ url, params, stuff }) {
    const { matchingEvents, matchingEventGroups } = stuff;

    let items: HistoryEventWithId[] | CompactEventGroups;

    if (params.view === 'summary') items = matchingEvents;
    if (params.view === 'compact') items = matchingEventGroups;

    const [first] = items;

    if (matchingEvents.length && first?.id) {
      url.pathname = `${url.pathname}/${first.id}`;

      return {
        status: 302,
        redirect: String(url),
      };
    }

    return {};
  };
</script>
