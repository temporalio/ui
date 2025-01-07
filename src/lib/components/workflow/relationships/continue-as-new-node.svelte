<script lang="ts">
  export let x: number;
  export let y: number;
  export let span: number;
  export let label: string;
  export let value: string;
  export let href: string | undefined = undefined;
  export let dash = false;

  const radius = 50;
</script>

<circle
  cx={x}
  cy={y}
  r={radius}
  class="fill-indigo-200 dark:fill-indigo-600"
  fill-opacity={dash ? '.5' : '1'}
/>
<text
  {x}
  y={y - radius - 5}
  class="text-center font-mono text-sm"
  fill="currentColor"
  text-anchor="middle"
  font-weight="500"
>
  {label}
</text>
<text
  {x}
  y={y + radius + 15}
  class="text-center font-mono text-sm"
  fill="currentColor"
  text-anchor="middle"
  font-weight="500"
>
  {#if href}
    <a class="cursor-pointer fill-blue-600 underline dark:fill-blue-300" {href}
      >{value}</a
    >
  {:else}
    {value}
  {/if}
</text>
{#if span > 0}
  <line
    x1={x + radius}
    y1={y}
    x2={x + span}
    y2={y}
    class="stroke-indigo-700 stroke-2 dark:stroke-indigo-300 dark:stroke-white"
    stroke-dasharray={dash ? '10' : 0}
  />
{/if}
