<script lang="ts">
  import CodeBlock from '$lib/components/code-block.svelte';

  export let events: HistoryEventWithId[];
</script>

<CodeBlock content={events} />
