<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';

  export let conditional = '=';
</script>

<div class="mt-2 transition-all hover:cursor-pointer">
  <div class="flex items-center" on:click={() => (conditional = '=')}>
    <div
      class="ml-4 mr-2 rounded-sm p-1 text-gray-900"
      class:active={conditional === '='}
    >
      Is
    </div>
  </div>
  <div class="flex items-center" on:click={() => (conditional = '!=')}>
    <div
      class="ml-4 mr-2 rounded-sm p-1 text-gray-900"
      class:active={conditional === '!='}
    >
      Is Not
    </div>
  </div>
</div>

<style lang="postcss">
  .active {
    @apply bg-gray-900 text-white;
  }
</style>
