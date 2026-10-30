<script lang="ts">
  import { prefersReducedMotion } from 'svelte/motion';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  const namespaceGlyph =
    'm8 0 .266.102 7.25 2.818.484.19v9.496l-.463.195-7.25 3.074L8 16l-.287-.122-7.25-3.073-.463-.2V3.11l.484-.189L7.734.102zM1.5 11.581l5.75 2.437V7.496L1.5 5.18zm7.25 2.437 5.75-2.437v-6.4L8.75 7.496zM8 1.646l-5.687 2.21L8 6.143l5.688-2.289z';

  const workflowGlyph =
    'M5.208 16H0v-5.208h5.208zm8.188-5.208a2.604 2.604 0 1 1 0 5.208 2.604 2.604 0 0 1 0-5.208M1.455 14.545h2.299v-2.299h-2.3zm11.94-2.299a1.15 1.15 0 1 0 .001 2.3 1.15 1.15 0 0 0 0-2.3M9.94 14.123H6.061V12.67h3.878zM3.331 9.94H1.877V6.061H3.33zM2.604 0a2.604 2.604 0 1 1 0 5.209 2.604 2.604 0 0 1 0-5.209M16 5.208h-5.208V0H16zM2.604 1.455a1.15 1.15 0 1 0 0 2.299 1.15 1.15 0 0 0 0-2.3m9.642 2.299h2.3v-2.3h-2.3zM9.94 3.33H6.061V1.877h3.878z';

  const CENTER = { x: 320, y: 220 };
  const RING = 40;
  const ORBIT = 170;
  const NAMESPACE = { w: 120, h: 88 };
  const CARD = { w: 56, h: 44 };
  const BADGE = 12;
  const ANGLES = [-90, -30, 30, 90, 150, 210];

  const round = (n: number) => Math.round(n * 10) / 10;

  const namespaces = ANGLES.map((deg) => {
    const rad = (deg * Math.PI) / 180;
    const ux = Math.cos(rad);
    const uy = Math.sin(rad);
    const x = CENTER.x + ORBIT * ux;
    const y = CENTER.y + ORBIT * uy;
    const reach = Math.min(
      NAMESPACE.w / 2 / Math.max(Math.abs(ux), 1e-6),
      NAMESPACE.h / 2 / Math.max(Math.abs(uy), 1e-6),
    );
    const badge = { x: round(x - reach * ux), y: round(y - reach * uy) };
    const edge = {
      x: round(CENTER.x + RING * ux),
      y: round(CENTER.y + RING * uy),
    };
    return {
      x: round(x),
      y: round(y),
      badge,
      edge,
      linkEnd: {
        x: round(badge.x - BADGE * ux),
        y: round(badge.y - BADGE * uy),
      },
    };
  });

  type Point = { x: number; y: number };
  type Leg = {
    kind: 'request' | 'response';
    from: Point;
    to: Point;
    arrivesAt: 'center' | number;
  };

  const LEG_MS = 1400;
  const DWELL_MS = 250;
  const PAUSE_MS = 900;
  const HIGHLIGHT_MS = 1100;

  let leg = $state<Leg | undefined>();
  let step = $state(0);
  let pulseKey = $state(0);
  let highlighted = $state<number | undefined>();

  const pick = (exclude?: number) => {
    const choices = namespaces
      .map((_, index) => index)
      .filter((index) => index !== exclude);
    return choices[Math.floor(Math.random() * choices.length)];
  };

  const roundTrip = (caller: number, handler: number): Leg[] => {
    const from = namespaces[caller];
    const to = namespaces[handler];
    return [
      { kind: 'request', from: from.badge, to: from.edge, arrivesAt: 'center' },
      { kind: 'request', from: to.edge, to: to.badge, arrivesAt: handler },
      { kind: 'response', from: to.badge, to: to.edge, arrivesAt: 'center' },
      { kind: 'response', from: from.edge, to: from.badge, arrivesAt: caller },
    ];
  };

  $effect(() => {
    if (prefersReducedMotion.current) return;

    let queue: Leg[] = [];
    let timer: ReturnType<typeof setTimeout> | undefined;
    let highlightTimer: ReturnType<typeof setTimeout> | undefined;

    const later = (ms: number, fn: () => void) => {
      clearTimeout(timer);
      timer = setTimeout(fn, ms);
    };

    const next = () => {
      if (!queue.length) {
        const caller = pick();
        queue = roundTrip(caller, pick(caller));
      }
      leg = queue.shift();
      step += 1;
    };

    const onLegEnd = () => {
      const arrivedAt = leg?.arrivesAt;
      if (arrivedAt === 'center') {
        pulseKey += 1;
        later(DWELL_MS, next);
        return;
      }
      highlighted = arrivedAt;
      clearTimeout(highlightTimer);
      highlightTimer = setTimeout(
        () => (highlighted = undefined),
        HIGHLIGHT_MS,
      );
      later(queue.length ? DWELL_MS : PAUSE_MS, next);
    };

    legEnded = onLegEnd;
    later(PAUSE_MS, next);

    return () => {
      clearTimeout(timer);
      clearTimeout(highlightTimer);
      legEnded = undefined;
      leg = undefined;
      highlighted = undefined;
    };
  });

  let legEnded: (() => void) | undefined;
</script>

<svg
  viewBox="0 0 640 440"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class="nexus-illustration {className}"
  style:--leg="{LEG_MS}ms"
  aria-hidden="true"
  focusable="false"
>
  <g class="namespace">
    {#each namespaces as { x, y } (`${x}:${y}`)}
      <rect
        x={x - NAMESPACE.w / 2}
        y={y - NAMESPACE.h / 2}
        width={NAMESPACE.w}
        height={NAMESPACE.h}
        rx="12"
      />
    {/each}
  </g>

  <g class="links">
    {#each namespaces as { edge, linkEnd } (`${edge.x}:${edge.y}`)}
      <line x1={edge.x} y1={edge.y} x2={linkEnd.x} y2={linkEnd.y} />
    {/each}
  </g>

  {#each namespaces as { x, y }, index (`${x}:${y}`)}
    <g class="node" class:highlight={highlighted === index}>
      <rect
        x={x - CARD.w / 2}
        y={y - CARD.h / 2}
        width={CARD.w}
        height={CARD.h}
        rx="8"
      />
      <g transform="translate({x - 12} {y - 12}) scale(1.5)">
        <path d={workflowGlyph} />
      </g>
    </g>
  {/each}

  <g class="boundary">
    {#each namespaces as { badge } (`${badge.x}:${badge.y}`)}
      <circle cx={badge.x} cy={badge.y} r={BADGE} />
      <g transform="translate({badge.x - 8} {badge.y - 8})">
        <path d={namespaceGlyph} />
      </g>
    {/each}
  </g>

  <g class="endpoint">
    {#key pulseKey}
      {#if pulseKey}
        <circle class="pulse" cx={CENTER.x} cy={CENTER.y} r={RING} />
      {/if}
    {/key}
    <circle class="ring" cx={CENTER.x} cy={CENTER.y} r={RING} />
    <g transform="translate({CENTER.x - 20} {CENTER.y - 20}) scale(2.5)">
      <path d="M7.25 0h1.5v16h-1.5z" />
      <path d="m14.788 3.7.68 1.336L1.213 12.3l-.68-1.336z" />
      <path d="m1.212 3.7-.68 1.336L14.787 12.3l.68-1.336z" />
    </g>
  </g>

  {#key step}
    {#if leg}
      <circle
        class="packet {leg.kind}"
        cx={leg.from.x}
        cy={leg.from.y}
        r="5"
        style:--dx="{round(leg.to.x - leg.from.x)}px"
        style:--dy="{round(leg.to.y - leg.from.y)}px"
        onanimationend={() => legEnded?.()}
      />
    {/if}
  {/key}
</svg>

<style>
  .nexus-illustration {
    --link: var(--color-border-tertiary);
    --card-fill: var(--color-surface-primary);
    --card-stroke: var(--color-border-secondary);
    --glyph: var(--color-content-secondary);
    --brand: var(--color-content-brand);
    --brand-fill: var(--color-surface-brand);
    --brand-stroke: var(--color-border-brand);
    --success: var(--color-content-success);
  }

  .namespace rect {
    fill: var(--color-surface-secondary);
    stroke: var(--link);
    stroke-width: 2;
    stroke-dasharray: 6 6;
  }

  .boundary circle {
    fill: var(--card-fill);
    stroke: var(--card-stroke);
    stroke-width: 2;
  }

  .boundary path {
    fill: var(--glyph);
  }

  .links line {
    stroke: var(--link);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-dasharray: 4 8;
    animation: flow 1.2s linear infinite;
  }

  .node rect {
    fill: var(--card-fill);
    stroke: var(--card-stroke);
    stroke-width: 2;
    transition: stroke 300ms ease-out;
  }

  .node path {
    fill: var(--glyph);
    transition: fill 300ms ease-out;
  }

  .node.highlight rect {
    stroke: var(--brand-stroke);
  }

  .node.highlight path {
    fill: var(--brand);
  }

  .endpoint .ring {
    fill: var(--brand-fill);
    stroke: var(--brand-stroke);
    stroke-width: 2;
  }

  .endpoint path {
    fill: var(--brand);
  }

  .pulse {
    fill: none;
    stroke: var(--brand-stroke);
    stroke-width: 2;
    opacity: 0;
    transform-origin: 320px 220px;
    animation: pulse 900ms ease-out forwards;
  }

  .packet {
    opacity: 0;
    animation: travel var(--leg) ease-in-out forwards;
  }

  .packet.request {
    fill: var(--brand);
  }

  .packet.response {
    fill: var(--success);
  }

  @keyframes flow {
    to {
      stroke-dashoffset: -12;
    }
  }

  @keyframes travel {
    0% {
      opacity: 0;
      transform: translate(0, 0);
    }

    12% {
      opacity: 1;
    }

    88% {
      opacity: 1;
    }

    100% {
      opacity: 0;
      transform: translate(var(--dx), var(--dy));
    }
  }

  @keyframes pulse {
    0% {
      opacity: 0.7;
      transform: scale(1);
    }

    100% {
      opacity: 0;
      transform: scale(1.45);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .nexus-illustration * {
      animation: none !important;
    }
  }
</style>
