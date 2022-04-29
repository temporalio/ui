<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ stuff }) {
    const { events } = stuff;

    return {
      props: { events },
    };
  };
</script>

<script lang="ts">
  import CodeBlock from '$lib/components/code-block.svelte';

  export let events: WorkflowEvents;
</script>

<CodeBlock content={events} dataCy="event-history-json" />
