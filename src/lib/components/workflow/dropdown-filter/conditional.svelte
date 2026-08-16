<script lang="ts">
  interface Props {
    conditional?: string;
  }

  let { conditional = $bindable('=') }: Props = $props();
</script>

<div
  class="surface-subtle mt-2 inline-flex gap-1 rounded-panel border border-subtle p-1"
>
  <button
    class="flex min-h-[var(--control-height-sm)] items-center rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
    onclick={() => (conditional = '=')}
  >
    <div class="px-2 py-1 text-primary" class:active={conditional === '='}>
      Is
    </div>
  </button>
  <button
    class="flex min-h-[var(--control-height-sm)] items-center rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
    onclick={() => (conditional = '!=')}
  >
    <div class="px-2 py-1 text-primary" class:active={conditional === '!='}>
      Is Not
    </div>
  </button>
</div>

<style lang="postcss">
  .active {
    @apply surface-primary rounded-control border border-subtle font-medium shadow-raised;
  }
</style>
