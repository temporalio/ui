<script lang="ts">
  import { getContext, type Snippet } from 'svelte';

  interface Props {
    title?: string;
    subtitle?: Snippet;
    children?: Snippet;
  }

  let { title = '', subtitle, children }: Props = $props();

  const position = getContext('drawer-pos');
</script>

<div class="title-wrapper {position}">
  <h2>{title}</h2>
  {#if subtitle}
    <p class="text-xs font-normal">
      {@render subtitle()}
    </p>
  {/if}
</div>

<div class="content {position}">
  {@render children?.()}
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
