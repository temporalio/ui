<script lang="ts">
  export let startPoint = [0, 1000];
  export let endPoint = [0, 1000];
  export let status: string | undefined = undefined;
  export let category: string | undefined = undefined;
  export let classification: string | undefined = undefined;
  export let scheduling = false;
  export let pending = false;
  export let paused = false;
  export let retried = false;
  export let strokeWidth: number = 2;
  export let strokeDasharray = 'none';

  $: [x1, y1] = startPoint;
  $: [x2, y2] = endPoint;
</script>

<defs>
  <pattern
    id="retried-pattern"
    width="10"
    height="10"
    patternUnits="userSpaceOnUse"
  >
    <rect x="0" y="0" width="5" height="10" fill="#00964e" />
    <rect x="5" y="0" width="5" height="10" fill="#c71607" />
  </pattern>
</defs>
<line
  class="line {status} {category} {classification}"
  class:scheduling
  class:animate-line={pending && !paused}
  class:retried={retried && classification === 'Completed'}
  stroke-width={strokeWidth}
  stroke-dasharray={pending ? '3' : strokeDasharray}
  x1={Math.max(0, x1)}
  x2={Math.max(0, x2)}
  {y1}
  {y2}
/>

<style lang="postcss">
  .line {
    cursor: pointer;
    opacity: 1;
    outline: none;
    stroke: #444ce7;
  }

  .none {
    stroke: #141414;
    opacity: 0.65;
  }

  .scheduling {
    opacity: 0.35;
  }

  .workflow,
  .marker,
  .command {
    stroke: #ebebeb;
  }

  .timer {
    stroke: #fbbf24;
  }

  .signal {
    stroke: #d300d8;
  }

  .activity {
    stroke: #a78bfa;
  }

  .pending {
    stroke: #a78bfa;
  }

  .retry {
    stroke: theme('colors.red.300');
  }

  .child-workflow {
    stroke: #67e4f9;
  }

  .Completed {
    stroke: #00964e;
  }

  .Failed,
  .Terminated {
    stroke: #c71607;
  }

  .Signaled {
    stroke: #d300d8;
  }

  .Fired {
    stroke: #f8a208;
  }

  .TimedOut {
    stroke: #f97316;
  }

  .Canceled {
    stroke: #fed64b;
  }

  .Running {
    stroke: #3b82f6;
  }

  .animate-line {
    stroke-dashoffset: 0;
    animation: dash 60s linear infinite;
  }

  .retried {
    stroke: url('#retried-pattern');
    opacity: 0.5;
  }

  @keyframes dash {
    from {
      stroke-dashoffset: 200;
    }

    to {
      stroke-dashoffset: 0;
    }
  }
</style>
