<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import type { Payload } from '$lib/types/deployments';
  import { metadataValue } from '$lib/utilities/version-details';

  interface Props {
    entries: Record<string, Payload> | undefined;
  }

  let { entries }: Props = $props();

  const rows = $derived(
    Object.entries(entries ?? {}).map(([key, payload]) => ({
      key,
      value: metadataValue(payload),
    })),
  );
</script>

{#if rows.length}
  <section aria-label={translate('deployments.details-metadata')}>
    <details class="text-sm">
      <summary class="cursor-pointer text-sm font-medium">
        {translate('deployments.details-metadata')}
        <span class="font-normal text-secondary">({rows.length})</span>
      </summary>
      <dl class="mt-3 grid grid-cols-[10rem_minmax(0,1fr)] gap-x-3 gap-y-1.5">
        {#each rows as row (row.key)}
          <dt class="break-all text-secondary">{row.key}</dt>
          <dd class="break-all font-mono text-xs leading-5">{row.value}</dd>
        {/each}
      </dl>
    </details>
  </section>
{/if}
