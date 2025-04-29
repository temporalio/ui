<script lang="ts">
  export let conditional = '=';
</script>

<div class="mt-2 transition-all hover:cursor-pointer">
  <button class="flex items-center" on:click={() => (conditional = '=')}>
    <div class="text-primary mr-2 ml-4 p-1" class:active={conditional === '='}>
      Is
    </div>
  </button>
  <button class="flex items-center" on:click={() => (conditional = '!=')}>
    <div class="text-primary mr-2 ml-4 p-1" class:active={conditional === '!='}>
      Is Not
    </div>
  </button>
</div>

<style lang="postcss">
  @reference "tailwindcss";

  .active {
    @apply bg-black text-white;
  }
</style>
