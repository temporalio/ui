<script lang="ts">
  import { IconArrowUp } from '$lib/io/icon';

  import McpExampleQuestion from './mcp-example-question.svelte';

  let { questions }: { questions: string[] } = $props();

  const label = 'After you connect it, ask your agent';
</script>

<div class="flex min-w-0 flex-col gap-2">
  <h3 class="sr-only">{label}</h3>
  <div
    class="flex items-center justify-between gap-3 rounded-lg border bg-surface-primary px-[11px] py-[7px] text-sm font-medium leading-5"
    aria-hidden="true"
  >
    <span class="min-w-0"
      ><span class="text-secondary">{label}…</span><span
        class="ml-0.5 border-l border-current"
      ></span></span
    >
    <IconArrowUp class="size-3 shrink-0 text-secondary" />
  </div>
  <ul class="space-y-2">
    {#each questions as question (question)}
      <McpExampleQuestion {question} />
    {/each}
  </ul>
</div>
