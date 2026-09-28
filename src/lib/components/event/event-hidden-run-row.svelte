<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { IconChevronDown, IconChevronRight } from '$lib/io/icon';
  import { isCloud } from '$lib/stores/advanced-visibility';
  import type { HiddenRunRow } from '$lib/utilities/history-review-collapse';

  interface Props {
    run: HiddenRunRow;
    onToggle: (key: string) => void;
  }

  let { run, onToggle }: Props = $props();

  const label = $derived(
    translate(
      run.open ? 'events.hidden-run-shown' : 'events.hidden-run-hidden',
      {
        count: run.count,
        first: run.firstId,
        last: run.lastId,
      },
    ),
  );
</script>

<tr class="bg-surface-secondary" data-testid="hidden-run-row">
  <td class="!p-0" colspan={$isCloud ? 5 : 4}>
    <button
      type="button"
      class="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-secondary hover:bg-interactive-secondary-hover hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-interactive-primary"
      aria-expanded={run.open}
      data-testid="hidden-run-toggle"
      data-run-key={run.key}
      onclick={() => onToggle(run.key)}
    >
      {#if run.open}
        <IconChevronDown width="1em" height="1em" />
      {:else}
        <IconChevronRight width="1em" height="1em" />
      {/if}
      <span>{label}</span>
    </button>
  </td>
</tr>
