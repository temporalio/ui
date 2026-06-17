<script lang="ts">
  // PERF: Drop-in replacement for <Icon> inside SVG contexts (dot, text,
  // workflow-row). Renders a single <use> element pointing at a <symbol>
  // defined once in TimelineIconDefs (inside the root <svg> of timeline-graph).
  //
  // This eliminates three previous cost sources:
  //   1. {…rest} spread → ownKeys Proxy + array.includes per attribute (fixed T2)
  //   2. {#if name===…} chain → BranchManager per icon instance (0.26% in T3)
  //   3. {@html paths[name]} → innerHTML parse per instance (not better than #2)
  //
  // <use> is the native SVG instancing mechanism: one DOM node, no JS branching,
  // no repeated path data, no string parsing. The symbol content is shared and
  // the browser caches it. Only href, x, y, width, height are set per instance.
  //
  // fill="currentColor" in each symbol inherits CSS `color` from the <use>
  // element, so Tailwind text-* classes work as expected for coloring.

  export type TimelineIconName =
    | 'workflow'
    | 'retry'
    | 'pause'
    | 'activity'
    | 'signal'
    | 'retention'
    | 'feather'
    | 'relationship'
    | 'update'
    | 'terminal'
    | 'nexus';

  interface Props {
    name: TimelineIconName;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    class?: string;
    style?: string;
  }

  let {
    name,
    x = 0,
    y = 0,
    width = 16,
    height = 16,
    class: className = '',
    style = '',
  }: Props = $props();
</script>

<use href="#ti-{name}" {x} {y} {width} {height} class={className} {style} />
