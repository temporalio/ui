<script lang="ts">
  export let status: string;
</script>

<div>{status}</div>

<style lang="postcss">
  div {
    @apply bg-green-200;
    @apply text-center;
    @apply text-green-600;
    @apply text-sm;
    @apply rounded-xl;
  }
</style>
