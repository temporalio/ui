<script lang="ts">
  import type { BannerColor } from '$lib/types/global';

  const colorClasses: Record<BannerColor, string> = {
    info: 'border-information bg-surface-information',
    warning: 'border-warning bg-surface-warning',
    success: 'border-success bg-surface-success',
    error: 'border-danger bg-surface-danger',
  };

  interface Props {
    text: string;
    color?: BannerColor;
    height?: number;
  }

  let { text, color = 'info', height = $bindable(0) }: Props = $props();
</script>

{#if text}
  <div
    bind:offsetHeight={height}
    class="fixed inset-x-0 top-0 z-[60] break-words border-b px-4 py-1 text-center text-base font-semibold tracking-wide text-primary {colorClasses[
      color
    ]}"
    data-testid="environment-banner"
  >
    {text}
  </div>
{/if}
