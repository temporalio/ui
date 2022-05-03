<script lang="ts">
  import Icon from 'svelte-fa';

  import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

  export let icon: IconDefinition;
  export let scale = 1;
  export let classes: string = '';
</script>

<button class="icon-button" on:click data-cy={$$props.dataCy}>
  {#if icon}
    <div class="flex gap-2 items-center {classes}">
      <Icon {icon} {scale} />
      <slot />
    </div>
  {:else}
    <slot />
  {/if}
</button>

<style lang="postcss">
  .icon-button {
    @apply inline-block p-1 text-sm w-8 h-8;
  }
</style>
