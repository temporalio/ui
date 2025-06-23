<script lang="ts">
  import { getContext } from 'svelte';

  export let title: string = '';

  let position = getContext('drawer-pos');
</script>

<div class="title-wrapper {position}">
  <h2>{title}</h2>
  {#if $$slots['subtitle']}
    <p class="text-xs font-normal">
      <slot name="subtitle" />
    </p>
  {/if}
</div>

<div class="content {position}">
  <slot />
</div>

<style lang="postcss">
  .title-wrapper {
    @apply flex flex-col justify-center gap-2 p-6;

    &.bottom {
      @apply items-start;
    }

    &.right {
      @apply items-start;
    }
  }

  .content {
    @apply whitespace-normal px-6 pb-6;
  }
</style>
