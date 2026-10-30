<script lang="ts">
  import { prefersReducedMotion } from 'svelte/motion';
  import { fade } from 'svelte/transition';

  import type { Snippet } from 'svelte';
  import { twJoin, twMerge } from 'tailwind-merge';

  import PlaceholderCards from '$lib/components/empty-states/placeholder-cards.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconComet, type IconComponent, IconWarning } from '$lib/io/icon';

  type Variant = 'page' | 'inline';

  interface Props {
    title: string;
    content?: string;
    error?: string;
    Icon?: IconComponent;
    variant?: Variant;
    testId?: string;
    class?: string;
    illustration?: Snippet;
    placeholder?: boolean;
    description?: Snippet;
    actions?: Snippet;
    resources?: Snippet;
    children?: Snippet;
  }

  let {
    title,
    content,
    error,
    Icon = IconComet,
    variant = 'page',
    testId,
    class: className,
    illustration,
    placeholder = false,
    description,
    actions,
    resources,
    children,
  }: Props = $props();

  const variantClasses: Record<Variant, string> = {
    page: 'my-12',
    inline: twJoin(
      'my-4 rounded-lg border border-dashed border-secondary',
      'bg-surface-secondary py-10',
    ),
  };

  const containerClass = $derived(
    twMerge(
      'flex w-full min-w-0 flex-col items-center gap-5',
      'whitespace-normal px-4 text-center text-primary',
      variantClasses[variant],
      className,
    ),
  );

  const showPlaceholder = $derived(placeholder && !error);

  const iconBackdropClass = $derived(
    twJoin(
      'flex size-14 shrink-0 items-center justify-center rounded-lg',
      error
        ? 'bg-surface-danger text-danger'
        : 'bg-interactive-secondary-hover text-brand',
      showPlaceholder && 'md:hidden',
    ),
  );

  const ResolvedIcon = $derived(error ? IconWarning : Icon);
  const hasDescription = $derived(Boolean(description || content));
  const fadeIn = $derived({
    duration: prefersReducedMotion.current ? 0 : 200,
  });
</script>

<div
  class={containerClass}
  data-testid={testId}
  aria-live="polite"
  in:fade={fadeIn}
>
  {#if illustration && !error}
    <div class="flex w-full max-w-full justify-center" aria-hidden="true">
      {@render illustration()}
    </div>
  {:else}
    {#if showPlaceholder}
      <PlaceholderCards />
    {/if}
    <span class={iconBackdropClass} aria-hidden="true">
      <ResolvedIcon class="size-7" />
    </span>
  {/if}

  <div class="flex w-full min-w-0 max-w-lg flex-col items-center gap-2">
    <h2 class="text-balance text-xl font-medium">{title}</h2>
    {#if error}
      <CodeBlock
        content={error}
        language="text"
        copyable
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
        disableMaximize
        class="mt-2 w-full text-left"
      />
    {:else if hasDescription}
      <div
        class="flex w-full flex-col gap-2 text-pretty text-sm text-secondary"
      >
        {#if description}
          {@render description()}
        {:else}
          <p>{content}</p>
        {/if}
      </div>
    {/if}
  </div>

  {#if !error}
    {#if actions}
      <div class="flex flex-wrap items-center justify-center gap-2">
        {@render actions()}
      </div>
    {/if}

    {@render children?.()}

    {#if resources}
      <div
        class="mt-1 flex w-full max-w-2xl flex-col items-center gap-3 border-t border-primary pt-6"
      >
        {@render resources()}
      </div>
    {/if}
  {/if}
</div>
