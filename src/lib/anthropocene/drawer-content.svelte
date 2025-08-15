<script lang="ts">
  import { getContext } from 'svelte';

  interface Props {
    title?: string;
    subtitle?: import('svelte').Snippet;
    children?: import('svelte').Snippet;
  }

  let { title = '', subtitle, children }: Props = $props();

  let position = getContext('drawer-pos');
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
  {#if children}{@render children()}{/if}
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
