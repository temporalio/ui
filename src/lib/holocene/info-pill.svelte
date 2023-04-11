<script lang="ts">
  export let label: string;
</script>

<div
  class="flex w-fit flex-row gap-1 items-center justify-center break-all rounded-xl p-1 text-sm font-medium transition-colors {$$props.class}"
>
  <div class="label">{label}</div>
  <div class="value">
    <slot />
  </div>
</div>

<style lang="postcss">
  .label {
    @apply text-[12px] font-light;
  }

  .value {
    @apply bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-1 font-medium;
  }
</style>
