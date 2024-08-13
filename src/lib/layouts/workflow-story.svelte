<script lang="ts">
  import Markdown from '$lib/holocene/monaco/markdown.svelte';
  import { workflowRun } from '$lib/stores/workflow-run';

  $: ({ workflow } = $workflowRun);
</script>

<div class="flex flex-col gap-2">
  {#if workflow?.summary}
    <Markdown content={workflow.summary} class="border-4 border-success" />
  {/if}
  {#if workflow?.details}
    <Markdown content={workflow.details} class="border-4 border-interactive" />
  {/if}
</div>
