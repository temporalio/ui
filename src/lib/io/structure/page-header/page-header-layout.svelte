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
  <div class="heading-layout min-w-0 gap-y-lg">
    {#if actions}
      <div
        class="actions flex min-h-10 min-w-0 flex-wrap items-center gap-x-lg gap-y-sm leading-10"
      >
        {@render actions()}
      </div>
    {/if}
    <div class="heading-content min-w-0">
      <div class="heading-line min-w-0 leading-10">
        {#if leading}
          <div class="inline-flex min-h-6 items-center gap-lg align-middle">
            {@render leading()}
          </div>
        {/if}
        <h1
          class="inline text-base font-medium text-primary [overflow-wrap:anywhere]"
        >
          {@render heading()}
        </h1>
        {#if headingActions}
          <div class="inline-flex min-h-6 items-center gap-lg align-middle">
            {@render headingActions()}
          </div>
        {/if}
        {#if tags}
          {@render tags()}
        {/if}
      </div>
      {#if description}
        <div
          class={twMerge(
            'description',
            'mt-sm min-w-0 text-xs leading-6 text-secondary',
          )}
        >
          {@render description()}
        </div>
      {/if}
    </div>
  </div>
  {#if filters}
    <div class="flex min-w-0 flex-wrap gap-lg">
      {@render filters()}
    </div>
  {/if}
  {#if metadata}
    <div class="flex min-w-0 flex-wrap gap-lg">
      {@render metadata()}
    </div>
  {/if}
</header>

<style>
  .wrapper {
    container-name: page-header;
    container-type: inline-size;
  }

  .heading-layout {
    display: flex;
    flex-direction: column;
  }

  .actions {
    order: 1;
  }

  .heading-line > :global(*),
  .description > :global(*) {
    margin-inline-end: var(--spacing-lg);
    vertical-align: middle;
  }

  @container page-header (min-width: 518px) {
    .heading-layout {
      display: flow-root;
    }

    .actions {
      float: right;
      max-width: 35%;
      margin-inline-start: var(--spacing-page-gutter);
      justify-content: end;
    }
  }
</style>
