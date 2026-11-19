<script lang="ts">
  import { getCategoryStrokeColor } from '$lib/components/lines-and-dots/colors';
  import { translate } from '$lib/i18n/translate';

  import { nonZeroCountDisplays } from './run-card-labels';
  import type { RunCounts } from './run-counts';

  interface Props {
    counts: RunCounts;
    suffix: string;
  }

  let { counts, suffix }: Props = $props();
</script>

<span
  class="flex min-w-0 items-center gap-2 text-xs tabular-nums text-secondary"
>
  {#each nonZeroCountDisplays(counts) as { key, Icon, category } (key)}
    <span class="flex items-center gap-0.5">
      <span class="flex text-sm" style:color={getCategoryStrokeColor(category)}
        ><Icon /></span
      >{counts[key]}{suffix}
    </span>
  {/each}
  {#if counts.failed || counts.retried}
    <span class="ml-auto flex shrink-0 items-center gap-2 pl-2 font-medium">
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
