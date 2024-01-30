<script lang="ts">
  export let error = false;
</script>

<div class="panel bg-white {$$props.class}" class:error>
  <slot />
</div>

<style lang="postcss">
  .panel {
    @apply rounded-xl border-2 border-slate-900 p-8;
  }

  .error {
    @apply border-red-700 bg-red-50;
  }
</style>
