<script lang="ts">
  import { getContext } from 'svelte';

  export let title: string = '';

  let position = getContext('drawer-pos');
</script>

<div class="title-wrapper {position}">
  <h1>{title}</h1>
  {#if $$slots['subtitle']}
    <h3 class="font-primary text-xs font-normal">
      <slot name="subtitle" />
    </h3>
  {/if}
</div>

<div class="content {position}">
  <slot />
</div>

<style lang="postcss">
  .title-wrapper {
    @apply flex flex-col justify-center gap-2 px-8 py-4;

    &.bottom {
      @apply items-start;
    }

    &.right {
      @apply items-start;
    }
  }

  .title-wrapper h1 {
    @apply font-primary text-base font-medium;
  }

  .content {
    @apply whitespace-normal px-8;

    &.right {
      @apply py-4;
    }

    &.bottom {
      @apply py-8;
    }
  }
</style>
