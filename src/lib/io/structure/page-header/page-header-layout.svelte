<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  interface PageHeaderLayoutProps extends Omit<
    HTMLAttributes<HTMLElement>,
    'children' | 'class'
  > {
    class?: string;
    heading: Snippet;
    leading?: Snippet;
    headingActions?: Snippet;
    tags?: Snippet;
    description?: Snippet;
    actions?: Snippet;
    filters?: Snippet;
    metadata?: Snippet;
  }

  const {
    actions,
    class: className,
    heading,
    leading,
    headingActions,
    tags,
    description,
    filters,
    metadata,
    ...rest
  }: PageHeaderLayoutProps = $props();
</script>

<header
  class={twMerge(
    'wrapper',
    'mx-page-margin flex min-w-0 flex-col gap-lg py-lg',
    className,
  )}
  {...rest}
>
  <div class={twMerge('layout-grid', 'min-w-0 gap-x-page-gutter gap-y-lg')}>
    <div class="heading-content flex flex-col gap-y-sm">
      <div
        class={twMerge(
          'inline-flex min-w-0 flex-wrap items-center gap-x-lg gap-y-sm leading-6',
        )}
      >
        {#if leading}
          <div class="flex shrink-0 gap-lg">
            {@render leading()}
          </div>
        {/if}
        <h1
          class="min-w-0 text-base font-medium text-primary [overflow-wrap:anywhere]"
        >
          {@render heading()}
        </h1>
        {#if headingActions}
          <div class="flex shrink-0 gap-lg">
            {@render headingActions()}
          </div>
        {/if}
        {#if tags}
          <div class="flex min-w-0 flex-wrap items-center gap-lg">
            {@render tags()}
          </div>
        {/if}
      </div>
      {#if description}
        <div
          class={twMerge(
            'description',
            'flex min-w-0 flex-wrap items-center gap-lg text-xs text-secondary',
          )}
        >
          {@render description()}
        </div>
      {/if}
    </div>
    {#if actions}
      <div
        class={twMerge(
          'actions',
          'flex min-w-0 flex-wrap gap-x-lg gap-y-sm self-start',
        )}
      >
        {@render actions()}
      </div>
    {/if}
    {#if filters}
      <div class="col-span-full flex min-w-0 flex-wrap gap-lg">
        {@render filters()}
      </div>
    {/if}
    {#if metadata}
      <div class="col-span-full flex min-w-0 flex-wrap gap-lg">
        {@render metadata()}
      </div>
    {/if}
  </div>
</header>

<style>
  .wrapper {
    container-name: page-header;
    container-type: inline-size;
  }

  .layout-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
  }

  .heading-content {
    grid-column: 1;
    grid-row: 1;
  }

  @container page-header (min-width: 580px) {
    .layout-grid:has(> .actions) {
      grid-template-columns: minmax(0, 1fr) fit-content(35%);
    }

    .actions {
      grid-column: 2;
      grid-row: 1;
      justify-content: end;
    }
  }
</style>
