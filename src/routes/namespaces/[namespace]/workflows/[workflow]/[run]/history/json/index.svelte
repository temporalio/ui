<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ stuff, page }: LoadInput) {
    const { events } = stuff as {
      events: HistoryEventWithId[];
    };

    return {
      props: {
        events,
      },
    };
  }
</script>

<script lang="ts">
  export let events: HistoryEventWithId[];
</script>

<section class="overflow-y-scroll">
  <pre>
    <code>
      {JSON.stringify(events, null, 2)}
    </code>
  </pre>
</section>
