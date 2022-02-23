<script lang="ts" context="module">
  import type { LoadInput } from '@sveltejs/kit';

  export const load = async ({ stuff }: LoadInput) => {
    const { events } = stuff;

    return {
      props: { events },
    };
  };
</script>

<script lang="ts">
  import CodeBlock from '$lib/components/code-block.svelte';

  export let events: HistoryEventWithId[];
</script>

<CodeBlock content={events} />
