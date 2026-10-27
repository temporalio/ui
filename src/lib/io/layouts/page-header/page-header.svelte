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
    'flex min-w-0 flex-col gap-io-lg px-page-margin py-io-lg',
    className,
  )}
  {...rest}
>
  <div
    class="flex min-w-0 flex-wrap items-baseline gap-x-page-gutter gap-y-io-sm"
  >
    <div class="flex min-w-0 flex-1 basis-[20rem] flex-col gap-io-sm">
      <div
        class="flex min-w-0 flex-wrap items-baseline gap-x-io-lg gap-y-io-sm"
      >
        {#if leading}
          <div class="flex shrink-0 items-center gap-io-lg">
            {@render leading()}
          </div>
        {/if}
        <h1
          class="min-w-0 text-base leading-6 font-medium [overflow-wrap:anywhere] text-primary"
        >
          {@render heading()}
        </h1>
        {#if headingActions}
          <div class="flex shrink-0 items-center gap-x-io-lg gap-y-io-sm">
            {@render headingActions()}
          </div>
        {/if}
        {#if tags}
          <div
            class="flex min-w-0 flex-wrap items-center gap-x-io-lg gap-y-io-sm"
          >
            {@render tags()}
          </div>
        {/if}
      </div>
      {#if description}
        <div
          class="min-w-0 text-xs leading-4 [overflow-wrap:anywhere] text-primary"
        >
          {@render description()}
        </div>
      {/if}
    </div>
    {#if actions}
      <div
        class="flex max-w-full flex-wrap items-baseline justify-start gap-x-io-lg gap-y-io-sm"
      >
        {@render actions()}
      </div>
    {/if}
  </div>
  {#if filters}
    <div class="flex min-w-0 flex-wrap items-center gap-x-io-lg gap-y-io-sm">
      {@render filters()}
    </div>
  {/if}
  {#if metadata}
    <div class="flex min-w-0 flex-wrap items-center gap-x-io-lg gap-y-io-sm">
      {@render metadata()}
    </div>
  {/if}
</header>
