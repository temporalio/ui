<script lang="ts">
  import type { BannerColor } from '$lib/types/global';

  const colorClasses: Record<BannerColor, string> = {
    neutral: 'border-tertiary bg-surface-tertiary text-secondary',
    info: 'border-information bg-surface-information text-information',
    warning: 'border-warning bg-surface-warning text-warning',
    success: 'border-success bg-surface-success text-success',
    danger: 'border-danger bg-surface-danger text-danger',
    error: 'border-error bg-surface-error text-error',
    accent: 'border-accent bg-surface-accent text-accent',
  };

  interface Props {
    text: string;
    color?: BannerColor;
  }

  let { text, color = 'info' }: Props = $props();
  let height = $state(0);

  $effect(() => {
    const style = document.documentElement.style;
    const previousHeight = style.getPropertyValue(
      '--environment-banner-height',
    );
    style.setProperty('--environment-banner-height', `${text ? height : 0}px`);

    return () => {
      if (previousHeight) {
        style.setProperty('--environment-banner-height', previousHeight);
      } else {
        style.removeProperty('--environment-banner-height');
      }
    };
  });
</script>

{#if text}
  <div
    bind:offsetHeight={height}
    class="fixed inset-x-0 top-0 z-30 border-b px-4 py-1 text-center text-base font-semibold tracking-wide break-words {colorClasses[
      color
    ]}"
    data-testid="environment-banner"
  >
    {text}
  </div>
{/if}
