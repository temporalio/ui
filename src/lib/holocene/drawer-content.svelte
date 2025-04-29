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
  @reference "tailwindcss";

  .title-wrapper {
    @apply flex flex-col justify-center gap-2 px-8 py-4;

    &.bottom {
      @apply items-start;
    }

    &.right {
      @apply items-start;
    }
  }

  .content {
    @apply px-8 whitespace-normal;

    &.right {
      @apply py-4;
    }

    &.bottom {
      @apply py-8;
    }
  }
</style>
