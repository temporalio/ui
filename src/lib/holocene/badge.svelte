<script lang="ts" context="module">
  export type BadgeType =
    | 'alpha'
    | 'beta'
    | 'warning'
    | 'error'
    | 'default'
    | 'count'
    | 'active'
    | 'available'
    | 'running'
    | 'red'
    | 'yellow'
    | 'green'
    | 'blue'
    | 'purple'
    | 'gray';
</script>

<script lang="ts">
  export let type: BadgeType = 'default';
</script>

<div
  class="{type} flex w-fit flex-row items-center justify-center text-nowrap break-all rounded-sm p-1 text-sm font-medium leading-4 transition-colors {$$props.class}"
>
  <slot />
</div>

<style lang="postcss">
  .beta,
  .running,
  .blue {
    @apply border-blue-700 bg-indigo-400 text-black;
  }

  .alpha,
  .purple {
    @apply border-purple-700 bg-purple-100 text-purple-700;
  }

  .error,
  .red {
    @apply border-red-700 bg-red-300 text-black;
  }

  .warning,
  .yellow {
    @apply border-yellow-900 bg-yellow-200 text-black;
  }

  .default,
  .gray {
    @apply bg-badge text-primary dark:bg-slate-100 dark:text-black;
  }

  .active,
  .available,
  .green {
    @apply border-green-700 bg-green-100 text-green-800;
  }

  .count {
    @apply h-6 w-6 min-w-max rounded-full bg-indigo-400 text-black;
  }
</style>
