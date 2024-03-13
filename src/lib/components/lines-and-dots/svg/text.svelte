<script lang="ts">
  import type { EventTypeCategory } from '$lib/types/events';

  export let point: [number, number] = [0, 0];
  export let category: EventTypeCategory | 'pending' | 'none' = 'none';
  export let active = false;
  export let position: 'start' | 'middle' | 'end' = 'start';

  $: [x, y] = point;
</script>

{#if position === 'middle'}
  <text
    filter="url(#bg-text)"
    class="cursor-pointer select-none outline-none {category} {position}"
    class:active
    {x}
    {y}
    text-anchor={'start'}
  >
    <slot />
  </text>
{:else}
  <text
    class="cursor-pointer select-none outline-none {category} {position}"
    class:active
    {x}
    {y}
    text-anchor={position === 'end' ? 'end' : 'start'}
  >
    <slot />
  </text>
{/if}

<style lang="postcss">
  text {
    fill: #fff;
    font-size: 16px;
    font-weight: 400;
    opacity: 0.25;
    stroke: none;
  }

  .none {
    font-size: 14px;
    fill: #aebed9;
  }

  .active {
    opacity: 1;
  }

  text.marker,
  .command {
    fill: #ebebeb;
  }

  text.timer {
    fill: #fbbf24;
  }

  text.signal {
    fill: #ec4899;
  }

  text.activity {
    fill: #a78bfa;
  }

  text.pending {
    fill: #a78bfa;
  }

  text.child-workflow {
    fill: #b2f8d9;
  }

  text.workflow {
    fill: #059669;
  }

  text.middle {
    fill: white;
  }
</style>
