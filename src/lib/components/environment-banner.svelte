<script lang="ts">
  interface Props {
    text: string;
    height?: number;
  }

  let { text, height = $bindable(0) }: Props = $props();
</script>

{#if text}
  <div
    bind:offsetHeight={height}
    class="fixed inset-x-0 top-0 z-[60] break-words border-b border-information bg-surface-information px-4 py-2 text-center text-sm font-medium text-primary"
    data-testid="environment-banner"
  >
    {text}
  </div>
{/if}
