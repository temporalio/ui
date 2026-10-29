<script lang="ts">
  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  const namespaceGlyph =
    'm8 0 .266.102 7.25 2.818.484.19v9.496l-.463.195-7.25 3.074L8 16l-.287-.122-7.25-3.073-.463-.2V3.11l.484-.189L7.734.102zM1.5 11.581l5.75 2.437V7.496L1.5 5.18zm7.25 2.437 5.75-2.437v-6.4L8.75 7.496zM8 1.646l-5.687 2.21L8 6.143l5.688-2.289z';

  const workflowGlyph =
    'M5.208 16H0v-5.208h5.208zm8.188-5.208a2.604 2.604 0 1 1 0 5.208 2.604 2.604 0 0 1 0-5.208M1.455 14.545h2.299v-2.299h-2.3zm11.94-2.299a1.15 1.15 0 1 0 .001 2.3 1.15 1.15 0 0 0 0-2.3M9.94 14.123H6.061V12.67h3.878zM3.331 9.94H1.877V6.061H3.33zM2.604 0a2.604 2.604 0 1 1 0 5.209 2.604 2.604 0 0 1 0-5.209M16 5.208h-5.208V0H16zM2.604 1.455a1.15 1.15 0 1 0 0 2.299 1.15 1.15 0 0 0 0-2.3m9.642 2.299h2.3v-2.3h-2.3zM9.94 3.33H6.061V1.877h3.878z';
</script>

<svg
  viewBox="0 0 640 220"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class="nexus-illustration {className}"
  aria-hidden="true"
  focusable="false"
>
  <g class="namespace">
    <rect x="16" y="40" width="200" height="140" rx="16" />
    <rect x="424" y="40" width="200" height="140" rx="16" />
  </g>

  <g class="links">
    <line x1="144" y1="110" x2="200" y2="110" />
    <line x1="232" y1="110" x2="280" y2="110" />
    <line x1="360" y1="110" x2="408" y2="110" />
    <line x1="440" y1="110" x2="496" y2="110" />
  </g>

  <g class="node caller">
    <rect x="48" y="70" width="96" height="80" rx="12" />
    <g transform="translate(78 92) scale(2.25)">
      <path d={workflowGlyph} />
    </g>
  </g>

  <g class="node handler">
    <rect x="496" y="70" width="96" height="80" rx="12" />
    <g transform="translate(526 92) scale(2.25)">
      <path d={workflowGlyph} />
    </g>
  </g>

  <g class="boundary">
    <circle cx="216" cy="110" r="16" />
    <g transform="translate(206 100) scale(1.25)">
      <path d={namespaceGlyph} />
    </g>
    <circle cx="424" cy="110" r="16" />
    <g transform="translate(414 100) scale(1.25)">
      <path d={namespaceGlyph} />
    </g>
  </g>

  <g class="endpoint">
    <circle class="pulse pulse-request" cx="320" cy="110" r="40" />
    <circle class="pulse pulse-response" cx="320" cy="110" r="40" />
    <circle class="ring" cx="320" cy="110" r="40" />
    <g transform="translate(300 90) scale(2.5)">
      <path d="M7.25 0h1.5v16h-1.5z" />
      <path d="m14.788 3.7.68 1.336L1.213 12.3l-.68-1.336z" />
      <path d="m1.212 3.7-.68 1.336L14.787 12.3l.68-1.336z" />
    </g>
  </g>

  <circle class="packet request" cx="144" cy="110" r="6" />
  <circle class="packet response" cx="496" cy="110" r="6" />
</svg>

<style>
  .nexus-illustration {
    --cycle: 4.8s;
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
    transition: stroke 200ms;
  }

  .node path {
    fill: var(--glyph);
  }

  .caller rect {
    animation: card-highlight var(--cycle) linear infinite;
    animation-delay: calc(var(--cycle) * 0.86);
  }

  .caller path {
    animation: glyph-highlight var(--cycle) linear infinite;
    animation-delay: calc(var(--cycle) * 0.86);
  }

  .handler rect {
    animation: card-highlight var(--cycle) linear infinite;
    animation-delay: calc(var(--cycle) * 0.38);
  }

  .handler path {
    animation: glyph-highlight var(--cycle) linear infinite;
    animation-delay: calc(var(--cycle) * 0.38);
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
    transform-origin: 320px 110px;
    animation: pulse var(--cycle) ease-out infinite;
  }

  .pulse-request {
    animation-delay: calc(var(--cycle) * 0.18);
  }

  .pulse-response {
    animation-delay: calc(var(--cycle) * 0.66);
  }

  .packet {
    opacity: 0;
  }

  .packet.request {
    fill: var(--brand);
    animation: travel-forward var(--cycle) ease-in-out infinite;
  }

  .packet.response {
    fill: var(--success);
    animation: travel-back var(--cycle) ease-in-out infinite;
    animation-delay: calc(var(--cycle) * 0.48);
  }

  @keyframes flow {
    to {
      stroke-dashoffset: -12;
    }
  }

  @keyframes travel-forward {
    0% {
      opacity: 0;
      transform: translateX(0);
    }

    4% {
      opacity: 1;
    }

    34% {
      opacity: 1;
      transform: translateX(352px);
    }

    38%,
    100% {
      opacity: 0;
      transform: translateX(352px);
    }
  }

  @keyframes travel-back {
    0% {
      opacity: 0;
      transform: translateX(0);
    }

    4% {
      opacity: 1;
    }

    34% {
      opacity: 1;
      transform: translateX(-352px);
    }

    38%,
    100% {
      opacity: 0;
      transform: translateX(-352px);
    }
  }

  @keyframes pulse {
    0% {
      opacity: 0.7;
      transform: scale(1);
    }

    14%,
    100% {
      opacity: 0;
      transform: scale(1.45);
    }
  }

  @keyframes card-highlight {
    0%,
    2% {
      stroke: var(--brand-stroke);
    }

    12%,
    100% {
      stroke: var(--card-stroke);
    }
  }

  @keyframes glyph-highlight {
    0%,
    2% {
      fill: var(--brand);
    }

    12%,
    100% {
      fill: var(--glyph);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .nexus-illustration * {
      animation: none !important;
    }

    .packet {
      opacity: 1;
    }

    .packet.request {
      transform: translateX(96px);
    }

    .packet.response {
      transform: translateX(-96px);
    }
  }
</style>
