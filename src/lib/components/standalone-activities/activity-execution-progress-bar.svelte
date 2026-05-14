<script lang="ts">
  import Card from '$lib/holocene/card.svelte';

  interface Props {
    attempt: number;
    maximumAttempts: number;
  }

  let { attempt, maximumAttempts }: Props = $props();
</script>

{#if maximumAttempts}
  <Card class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <h5 class="text-xs font-semibold uppercase tracking-wide text-secondary">
        Progress
      </h5>
      <span class="text-xs text-secondary">{attempt} / {maximumAttempts}</span>
    </div>
    <div class="h-2 w-full overflow-hidden rounded-full bg-subtle">
      <div
        class="h-full rounded-full bg-brand transition-all"
        style="width: {maximumAttempts > 0
          ? (attempt / maximumAttempts) * 100
          : 0}%"
      ></div>
    </div>
  </Card>
{/if}
