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
  class="{type} flex w-fit flex-row items-center justify-center break-all rounded-sm p-1 text-sm leading-4 font-medium transition-colors {$$props.class}"
>
  <slot />
</div>

<style lang="postcss">
  .beta,
  .running,
  .blue {
    @apply border-blue-700 bg-blue-100 text-blue-700;
  }

  .alpha,
  .purple {
    @apply border-purple-700 bg-purple-100 text-purple-700;
  }

  .error,
  .red {
    @apply border-red-700 bg-red-50 text-red-700;
  }

  .warning,
  .yellow {
    @apply border-yellow-900 bg-yellow-100 text-yellow-900;
  }

  .default,
  .gray {
    @apply border-gray-900 bg-gray-100 text-gray-900;
  }

  .active,
  .available,
  .green {
    @apply border-green-700 bg-green-100 text-green-700;
  }

  .count {
    @apply h-6 w-6 min-w-max rounded-full bg-blue-700 text-white;
  }
</style>
