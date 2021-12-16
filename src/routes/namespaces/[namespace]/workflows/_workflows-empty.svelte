<script lang="ts">
  import Icon from 'svelte-fa';
  import { faMeteor } from '@fortawesome/free-solid-svg-icons';
</script>

<div class="flex flex-col justify-start items-center gap-2">
  <span class="flex rounded-full circle items-center justify-center">
    <Icon icon={faMeteor} scale={1.2} class="block w-full h-full" /></span
  >
  <h2>No Workflows Found</h2>
  <p class="text-center">If you have filters applied, try adjusting them.</p>
</div>

<style lang="postcss">
  div {
    @apply mt-12;
  }

  h2 {
    @apply text-xl font-medium;
  }

  .circle {
    @apply w-16 h-16 bg-gray-200;
  }
</style>
