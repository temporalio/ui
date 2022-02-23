<script lang="ts">
  type BadgeTypes = 'alpha' | 'beta';

  export let type: BadgeTypes;
</script>

<div
  class={`${type}     
        rounded-sm
        text-center 
        inline-block
        px-1
        ml-1
        text-sm
        align-middle`}
>
  <slot />
</div>

<style lang="postcss">
  .beta {
    @apply bg-blue-100  text-blue-700  border-blue-700;
  }

  .alpha {
    @apply bg-purple-100 text-purple-700 border-purple-700;
  }
</style>
