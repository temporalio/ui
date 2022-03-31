<script lang="ts">
  import Icon from 'svelte-fa';

  import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

  export let icon: IconDefinition;
  export let scale = 1;
</script>

<button class="icon-button" on:click>
  {#if icon}
    <div class="flex gap-2 items-center">
      <Icon {icon} {scale} />
      <slot />
    </div>
  {:else}
    <slot />
  {/if}
</button>

<style lang="postcss">
  .icon-button {
    @apply inline-block inline p-1 text-sm flex items-center justify-center w-8 h-8;
  }
</style>
