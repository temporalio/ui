<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  export interface PageHeaderProps extends Omit<
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
  }: PageHeaderProps = $props();
</script>

<header
  class={twMerge(
    'flex min-w-0 flex-col gap-lg px-page-margin py-lg',
    className,
  )}
  {...rest}
>
  <div class="flex min-w-0 flex-wrap items-baseline gap-x-page-gutter gap-y-sm">
    <div class="flex min-w-0 flex-1 basis-[20rem] flex-col gap-sm">
      <div class="flex min-w-0 flex-wrap items-baseline gap-x-lg gap-y-sm">
        {#if leading}
          <div class="flex shrink-0 items-center gap-lg">
            {@render leading()}
          </div>
        {/if}
        <h1
          class="min-w-0 text-base font-medium leading-6 text-primary [overflow-wrap:anywhere]"
        >
          {@render heading()}
        </h1>
        {#if headingActions}
          <div class="flex shrink-0 items-center gap-x-lg gap-y-sm">
            {@render headingActions()}
          </div>
        {/if}
        {#if tags}
          <div class="flex min-w-0 flex-wrap items-center gap-x-lg gap-y-sm">
            {@render tags()}
          </div>
        {/if}
      </div>
      {#if description}
        <div
          class="min-w-0 text-xs leading-4 text-primary [overflow-wrap:anywhere]"
        >
          {@render description()}
        </div>
      {/if}
    </div>
    {#if actions}
      <div
        class="flex max-w-full flex-wrap items-baseline justify-start gap-x-lg gap-y-sm"
      >
        {@render actions()}
      </div>
    {/if}
  </div>
  {#if filters}
    <div class="flex min-w-0 flex-wrap items-center gap-x-lg gap-y-sm">
      {@render filters()}
    </div>
  {/if}
  {#if metadata}
    <div class="flex min-w-0 flex-wrap items-center gap-x-lg gap-y-sm">
      {@render metadata()}
    </div>
  {/if}
</header>
