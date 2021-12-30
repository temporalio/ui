<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ stuff }: LoadInput) {
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
  import CodeBlock from '$lib/components/code-block.svelte';
  export let events: HistoryEventWithId[];
</script>

<CodeBlock content={events} />
