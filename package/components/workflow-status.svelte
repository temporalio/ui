<script>import HeartBeat from './heart-beat-indicator.svelte';
export let status = 'Running';
export let delay = 0;
const humanFriendlyNames = {
    Running: 'Running',
    TimedOut: 'Timed Out',
    Completed: 'Completed',
    Failed: 'Failed',
    ContinuedAsNew: 'Continued as New',
    Canceled: 'Canceled',
    Terminated: 'Terminated',
    Paused: 'Paused',
};
const colors = {
    Running: 'blue',
    TimedOut: 'red',
    Completed: 'green',
    Failed: 'red',
    ContinuedAsNew: 'indigo',
    Canceled: 'yellow',
    Terminated: 'pink',
    Paused: 'yellow',
};
$: color = colors[status];
$: label = humanFriendlyNames[status];
$: isRunning = label === humanFriendlyNames.Running;
</script>

<span class="flex text-center text-sm font-medium leading-4">
  <h6 class="{color} z-10 flex rounded-sm px-1 py-1">
    <span class="whitespace-nowrap">{label}</span>
    {#if isRunning}
      <HeartBeat {delay} />
    {/if}
  </h6>
</span>

<style>
  .green {
    --tw-bg-opacity: 1;
    background-color: rgb(220 252 231 / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: rgb(21 128 61 / var(--tw-text-opacity))
}
  .yellow {
    --tw-bg-opacity: 1;
    background-color: rgb(254 249 195 / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: rgb(113 63 18 / var(--tw-text-opacity))
}
  .blue {
    --tw-bg-opacity: 1;
    background-color: rgb(219 234 254 / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: rgb(29 78 216 / var(--tw-text-opacity))
}
  .red {
    --tw-bg-opacity: 1;
    background-color: rgb(254 226 226 / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: rgb(185 28 28 / var(--tw-text-opacity))
}
  .indigo {
    --tw-bg-opacity: 1;
    background-color: rgb(224 231 255 / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: rgb(67 56 202 / var(--tw-text-opacity))
}
  .purple {
    --tw-bg-opacity: 1;
    background-color: rgb(243 232 255 / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: rgb(126 34 206 / var(--tw-text-opacity))
}
  .pink {
    --tw-bg-opacity: 1;
    background-color: rgb(252 231 243 / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: rgb(190 24 93 / var(--tw-text-opacity))
}</style>
