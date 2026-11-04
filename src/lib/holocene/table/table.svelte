<script lang="ts">
  import type { HTMLTableAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import ProgressBar from '$lib/holocene/progress-bar.svelte';

  interface Props extends HTMLTableAttributes {
    updating?: boolean;
    class?: string;
    containerClass?: string;
    'data-testid'?: string;
    fixed?: boolean;
    bordered?: boolean;
    rounded?: boolean;
    caption?: Snippet;
    headers?: Snippet;
    children?: Snippet;
    emptyState?: Snippet;
  }

  let {
    class: className = '',
    containerClass = '',
    updating = false,
    fixed = false,
    bordered = true,
    rounded = true,
    caption,
    headers,
    children,
    emptyState,
    ...rest
  }: Props = $props();

  let scrollContainer = $state<HTMLDivElement>();
  let showLoadingBar = $state(false);
  let loadingBarVisible = $state(false);
  let previousUpdating = $state<boolean>();
  let enterTimeout: ReturnType<typeof setTimeout> | undefined;
  let exitTimeout: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    if (updating === previousUpdating) return;
    previousUpdating = updating;

    if (updating) {
      if (exitTimeout) clearTimeout(exitTimeout);
      if (showLoadingBar) {
        loadingBarVisible = true;
        return;
      }

      showLoadingBar = true;
      loadingBarVisible = false;
      enterTimeout = setTimeout(() => {
        loadingBarVisible = true;
      }, 150);
      return;
    }

    if (enterTimeout) clearTimeout(enterTimeout);
    if (!showLoadingBar || !loadingBarVisible) {
      showLoadingBar = false;
      return;
    }

    loadingBarVisible = false;
    exitTimeout = setTimeout(() => {
      showLoadingBar = false;
    }, 350);
  });

  $effect(() => {
    return () => {
      if (enterTimeout) clearTimeout(enterTimeout);
      if (exitTimeout) clearTimeout(exitTimeout);
    };
  });

  export function scrollToTop() {
    if (!scrollContainer) return false;
    if (scrollContainer.scrollHeight <= scrollContainer.clientHeight) {
      return false;
    }

    scrollContainer.scrollTo({ top: 0, behavior: 'instant' });
    return true;
  }
</script>

<div
  bind:this={scrollContainer}
  class={merge(
    'relative flex max-h-full w-full flex-col overflow-auto',
    rounded && 'rounded-lg',
    bordered && 'border border-primary',
    containerClass,
  )}
>
  <table
    class={merge(
      'holocene-table min-w-full shrink-0 border-separate border-spacing-0',
      fixed ? 'layout-fixed' : 'layout-auto',
      className,
    )}
    aria-busy={updating ? 'true' : undefined}
    {...rest}
  >
    {@render caption?.()}
    <thead class="holocene-table-header">
      {@render headers?.()}
      {#if showLoadingBar}
        <tr
          aria-hidden="true"
          class={merge(
            '!h-0 bg-transparent transition-opacity',
            loadingBarVisible
              ? 'opacity-100 duration-[250ms]'
              : 'opacity-0 duration-[350ms]',
          )}
        >
          <th colspan="1000" class="relative !h-0 !border-0 !p-0">
            <ProgressBar subtle class="bottom-0" />
          </th>
        </tr>
      {/if}
    </thead>
    <tbody class="holocene-table-body">
      {@render children?.()}
    </tbody>
  </table>
  {@render emptyState?.()}
</div>

<style lang="postcss">
  .holocene-table {
    @apply table-auto bg-surface-primary text-primary;

    &.layout-auto {
      @apply table-auto;
    }

    &.layout-fixed {
      @apply table-fixed;
    }
  }

  .holocene-table.layout-auto > .holocene-table-header {
    :global(tr > th) {
      @apply whitespace-nowrap;
    }
  }

  .holocene-table.layout-auto > .holocene-table-body {
    :global(tr > td) {
      @apply whitespace-nowrap;
    }
  }

  .holocene-table-header {
    @apply sticky top-0 z-10;

    :global(tr) {
      @apply bg-surface-secondary text-primary;
    }

    :global(tr > th) {
      @apply h-9 border-b border-primary px-2 text-left text-sm font-medium;
    }
  }

  :where(.holocene-table-body) {
    :global(tr) {
      @apply border-b border-primary last-of-type:border-0 hover:bg-interactive-tertiary-hover hover:bg-fixed;
    }

    :global(tr.expanded) {
      @apply w-full hover:bg-surface-primary;
    }

    :global(tr:nth-of-type(even)) {
      @apply bg-surface-overlay-primary;
    }

    :global(tr > td) {
      @apply px-2;
    }

    :global(tr > td > .table-link) {
      @apply hover:text-brand hover:underline hover:decoration-brand;
    }

    :global(tr:not(.empty)) {
      @apply h-8 border-b border-primary last-of-type:border-0 hover:bg-interactive-tertiary-hover hover:bg-fixed;
    }
  }
</style>
