<script lang="ts">
  export let conditional = '=';
</script>

<div class="mt-2 transition-all hover:cursor-pointer">
  <button class="flex items-center" on:click={() => (conditional = '=')}>
    <div class="ml-4 mr-2 p-1 text-primary" class:active={conditional === '='}>
      Is
    </div>
  </button>
  <button class="flex items-center" on:click={() => (conditional = '!=')}>
    <div class="ml-4 mr-2 p-1 text-primary" class:active={conditional === '!='}>
      Is Not
    </div>
  </button>
</div>

<style lang="postcss">
  .active {
    @apply bg-black text-white;
  }
</style>
