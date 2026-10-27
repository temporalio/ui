<script lang="ts">
  type ReleaseStage = 'experimental' | 'pre-release';

  let { stage }: { stage?: ReleaseStage } = $props();

  const glowColor: Record<ReleaseStage, string> = {
    experimental: 'text-amber-9',
    'pre-release': 'text-blue-9',
  };
</script>

{#if stage}
  <div
    class={[
      'pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-[0.06] [background-image:radial-gradient(ellipse_at_top_left,currentColor,transparent_45%)]',
      glowColor[stage],
    ]}
    aria-hidden="true"
  ></div>
{/if}
<div
  class="pointer-events-none absolute inset-0 -z-10 text-secondary opacity-40 [background-image:radial-gradient(circle,currentColor_0.5px,transparent_1px)] [background-repeat:round] [background-size:16px_16px] [mask-image:linear-gradient(to_bottom,transparent_40%,black)]"
  aria-hidden="true"
></div>
