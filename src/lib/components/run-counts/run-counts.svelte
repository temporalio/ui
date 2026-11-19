<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import { getCategoryStrokeColor } from '$lib/components/lines-and-dots/colors';
  import { translate } from '$lib/i18n/translate';
  import type { RunCounts } from '$lib/models/event-history/run-counts';

  import { nonZeroCountDisplays } from './run-count-displays';

  interface Props {
    counts: RunCounts;
    suffix: string;
    variant?: 'card' | 'heading';
  }

  let { counts, suffix, variant = 'card' }: Props = $props();

  const isHeading = $derived(variant === 'heading');
  const succeeded = $derived(isHeading ? counts.succeeded : 0);
  const categoryDisplays = $derived(nonZeroCountDisplays(counts));
  const hasOutcomes = $derived(
    !!(succeeded || counts.failed || counts.retried),
  );
</script>

<span
  class={twMerge(
    'flex min-w-0 items-center gap-2 text-xs tabular-nums text-secondary',
    isHeading && 'flex-wrap gap-x-3 text-sm',
  )}
>
  {#each categoryDisplays as { key, Icon, category } (key)}
    <span class="flex items-center gap-0.5">
      <span class="flex text-sm" style:color={getCategoryStrokeColor(category)}
        ><Icon /></span
      >{counts[key]}{suffix}
    </span>
  {/each}
  {#if isHeading && hasOutcomes && categoryDisplays.length}
    <span aria-hidden="true" class="h-4 border-l border-secondary"></span>
  {/if}
  {#if hasOutcomes}
    <span
      class={twMerge(
        'flex shrink-0 items-center gap-2 font-medium',
        !isHeading && 'ml-auto pl-2',
      )}
    >
      {#if succeeded}
        <span class="text-static-success">
          {translate('workflows.run-count-succeeded', {
            count: succeeded,
            suffix,
          })}
        </span>
      {/if}
      {#if counts.failed}
        <span class="text-static-danger">
          {translate('workflows.run-count-failed', {
            count: counts.failed,
            suffix,
          })}
        </span>
      {/if}
      {#if counts.retried}
        <span class="text-static-warning">
          {translate('workflows.run-count-retried', {
            count: counts.retried,
            suffix,
          })}
        </span>
      {/if}
    </span>
  {/if}
</span>
