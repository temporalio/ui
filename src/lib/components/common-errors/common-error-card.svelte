<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconClose } from '$lib/io/icon';
  import type { CommonError } from '$lib/types/common-errors';

  import {
    countBySeverity,
    severityStyles,
    sortBySeverity,
  } from './common-error-severity';

  import CommonErrorAccordion from './common-error-accordion.svelte';

  interface Props {
    errors: CommonError[];
    dismissLabel?: string;
    onDismiss?: () => void;
    class?: string;
    'data-testid'?: string;
  }

  let {
    errors,
    dismissLabel = translate('common.dismiss'),
    onDismiss,
    class: className = '',
    ...rest
  }: Props = $props();

  const id = $props.id();

  const sortedErrors = $derived(sortBySeverity(errors));
  const counts = $derived(countBySeverity(sortedErrors));

  let scrollEl: HTMLDivElement | undefined = $state();
  let contentEl: HTMLDivElement | undefined = $state();
  let hasMoreBelow = $state(false);

  const updateScrollState = () => {
    if (!scrollEl) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollEl;
    hasMoreBelow = Math.ceil(scrollTop + clientHeight) < scrollHeight;
  };

  $effect(() => {
    const content = contentEl;
    const count = sortedErrors.length;
    if (!content || !count) return;

    updateScrollState();

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(content);
    return () => observer.disconnect();
  });

  let toggled: Record<number, boolean> = $state({});

  const isOpen = (error: CommonError) =>
    toggled[error.id] ?? error.id === sortedErrors[0]?.id;

  function toggle(error: CommonError) {
    toggled[error.id] = !isOpen(error);
  }
</script>

{#if sortedErrors.length > 0}
  <section
    aria-labelledby={id}
    class="rounded border border-primary bg-surface-primary {className}"
    {...rest}
  >
    <div
      class="flex items-center justify-between gap-2 border-b border-primary p-3"
    >
      <h5 {id}>{translate('workflows.common-errors')}</h5>
      <div class="flex items-center gap-3">
        {#each counts as { severity, count } (severity)}
          {@const style = severityStyles[severity]}
          <span class="body-normal flex items-center gap-1.5 text-secondary">
            <span
              class="h-2 w-2 shrink-0 rounded-full border border-current {style.iconClass} {style.dotClass}"
            ></span>
            {translate(`workflows.common-errors-${severity}`, { count })}
          </span>
        {/each}
        {#if onDismiss}
          <Tooltip text={dismissLabel} left>
            <Button
              aria-label={dismissLabel}
              class="h-8 w-8 shrink-0 p-0"
              disableTracking={true}
              LeadingIcon={IconClose}
              size="xs"
              variant="ghost"
              onclick={onDismiss}
            >
              <span class="sr-only">{dismissLabel}</span>
            </Button>
          </Tooltip>
        {/if}
      </div>
    </div>
    <div class="relative">
      <div
        bind:this={scrollEl}
        id="{id}-errors"
        class="max-h-64 overflow-y-auto"
        onscroll={updateScrollState}
      >
        <div bind:this={contentEl} class="flex flex-col divide-y">
          {#each sortedErrors as error (error.id)}
            <CommonErrorAccordion
              {error}
              open={isOpen(error)}
              onToggle={() => toggle(error)}
            />
          {/each}
        </div>
      </div>
      {#if hasMoreBelow}
        <span
          aria-hidden="true"
          class="pointer-events-none absolute inset-x-0 bottom-0 flex h-10 items-end justify-center bg-gradient-to-t from-surface-primary to-transparent"
        >
        </span>
      {/if}
    </div>
  </section>
{/if}
