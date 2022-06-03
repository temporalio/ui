<script lang="ts">
  type BadgeTypes = 'alpha' | 'beta';

  export let type: BadgeTypes;
</script>

<div
  class={`${type}     
        ml-1
        inline-block 
        rounded-sm
        px-1
        text-center
        align-middle
        text-sm`}
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
</style>
