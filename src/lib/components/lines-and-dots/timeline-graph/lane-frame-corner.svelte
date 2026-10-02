<script lang="ts">
  type Props = { side: 'start' | 'end' };

  let { side }: Props = $props();
</script>

<div
  class="lane-frame-corner pointer-events-none absolute top-0 size-2 {side ===
  'start'
    ? 'left-0'
    : 'right-0'}"
  class:lane-frame-corner-end={side === 'end'}
  aria-hidden="true"
></div>

<style lang="postcss">
  /* Paints the page back in outside a rounded top corner, over whatever is
     scrolling beneath a stuck header, so the frame keeps its curve. */
  .lane-frame-corner {
    background: radial-gradient(
      circle at 100% 100%,
      transparent 7.5px,
      var(--color-background-primary) 8px
    );
  }

  .lane-frame-corner-end {
    background: radial-gradient(
      circle at 0 100%,
      transparent 7.5px,
      var(--color-background-primary) 8px
    );
  }
</style>
