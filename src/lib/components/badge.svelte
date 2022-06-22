<script lang="ts" context="module">
  export type BadgeType = 'alpha' | 'beta' | 'warning' | 'default';
</script>

<script lang="ts">
  export let type: BadgeType = 'default';
</script>

<div
  class="{type} flex w-fit flex-row items-center rounded-sm p-1 text-sm font-medium"
>
  <slot />
</div>

<style lang="postcss">
  .beta {
    @apply border-blue-700  bg-blue-100  text-blue-700;
  }

  .alpha {
    @apply border-purple-700 bg-purple-100 text-purple-700;
  }

  .warning {
    @apply border-red-700 bg-red-50 text-red-700;
  }

  .default {
    @apply border-gray-700 bg-gray-300 text-gray-700;
  }
</style>
