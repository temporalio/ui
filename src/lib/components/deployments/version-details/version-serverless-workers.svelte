<script lang="ts">
  import {
    COMPUTE_PROVIDERS,
    computeProviderFromType,
  } from '$lib/components/workers/serverless-worker-form/compute-providers';
  import Card from '$lib/holocene/card.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ComputeConfig } from '$lib/types/deployments';
  import {
    computeProviderLabel,
    type NamespaceRegion,
  } from '$lib/utilities/compute-regions';
  import {
    GROUP_FIELDS,
    type GroupDetails,
    type GroupField,
    groupFieldLabel,
    LONG_FIELDS,
    REGIONAL_FIELDS,
    type RegionBlock,
    regionBlocks,
    type RegionHeading,
  } from '$lib/utilities/version-details';

  interface Props {
    computeConfig: ComputeConfig | undefined;
    namespaceRegions?: readonly NamespaceRegion[];
    editHref: string;
  }

  let { computeConfig, namespaceRegions = [], editHref }: Props = $props();

  const blocks = $derived(regionBlocks(computeConfig, namespaceRegions));
  const carded = $derived(blocks.length > 1);

  const fieldsOf = (group: GroupDetails): GroupField[] =>
    GROUP_FIELDS.filter((field) => group.values[field] !== undefined);

  const roleLabel = (role: RegionHeading['role']): string | undefined =>
    role === 'primary'
      ? translate('workers.region-role-primary')
      : role === 'replica'
        ? translate('workers.region-role-replica')
        : undefined;

  const roleCaption = (heading: RegionHeading): string | undefined =>
    heading.role === 'primary'
      ? translate('workers.region-role-primary-tooltip', {
          region: heading.label,
        })
      : heading.role === 'replica'
        ? translate('workers.region-role-replica-tooltip', {
            region: heading.label,
          })
        : undefined;

  /**
   * How a replica's field reads next to the primary's: its own value, its
   * value tagged as different, or "Same as primary". A regional resource
   * always shows its value.
   */
  type FieldState = 'value' | 'differs' | 'same';
  const fieldState = (block: RegionBlock, key: GroupField): FieldState => {
    if (block.kind !== 'group' || !block.comparison) return 'value';
    if (block.comparison.differs.has(key)) return 'differs';
    return REGIONAL_FIELDS.includes(key) ? 'value' : 'same';
  };

  /** Task queue types read as words: "TASK_QUEUE_TYPE_ACTIVITY" -> "Activity". */
  const taskQueueTypeLabel = (type: string): string => {
    const word = type.replace(/^TASK_QUEUE_TYPE_/, '').toLowerCase();
    return word.charAt(0).toUpperCase() + word.slice(1);
  };
</script>

{#snippet regionHeading(heading: RegionHeading)}
  <div class="flex flex-col gap-0.5">
    <h4 class="text-sm font-medium">
      {heading.label}
      {#if roleLabel(heading.role)}
        <span class="text-secondary" aria-hidden="true">·</span>
        <span class="font-normal text-secondary">{roleLabel(heading.role)}</span
        >
      {/if}
    </h4>
    {#if roleCaption(heading)}
      <p class="text-xs text-secondary">{roleCaption(heading)}</p>
    {/if}
  </div>
{/snippet}

{#snippet differs()}
  <span
    class="self-start rounded bg-surface-warning px-1.5 text-xs font-medium text-warning"
  >
    {translate('deployments.details-differs-from-primary')}
  </span>
{/snippet}

{#snippet field(
  group: GroupDetails,
  key: GroupField,
  regionLabel: string,
  state: FieldState,
)}
  {@const value = group.values[key] ?? ''}
  {@const tagged = state === 'differs'}
  {#if state === 'same'}
    <dt class="text-secondary">{groupFieldLabel(key)}</dt>
    <dd class="text-secondary">
      {translate('deployments.details-same-as-primary')}
    </dd>
  {:else if LONG_FIELDS.includes(key)}
    <div class="col-span-2 flex flex-col gap-0.5">
      <dt class="text-secondary">{groupFieldLabel(key)}</dt>
      <dd class="flex flex-col gap-1">
        <Copyable
          visible
          content={value}
          copyIconTitle={`${translate('common.copy-icon-title')}: ${groupFieldLabel(key)}, ${regionLabel}`}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
          container-class="min-w-0"
        >
          <span
            class="min-w-0 truncate font-mono text-xs leading-5"
            title={value}
          >
            {value}
          </span>
        </Copyable>
        {#if tagged}{@render differs()}{/if}
      </dd>
    </div>
  {:else}
    <dt class="text-secondary">{groupFieldLabel(key)}</dt>
    <dd class="flex flex-wrap items-center gap-2 tabular-nums">
      {value}
      {#if tagged}{@render differs()}{/if}
    </dd>
  {/if}
{/snippet}

{#snippet groupBody(
  block: Extract<RegionBlock, { kind: 'group' }>,
  showAllValues: boolean,
)}
  {@const group = block.group}
  {@const comparison = block.comparison}
  {@const provider = computeProviderFromType(group.providerType)}
  {@const ProviderIcon = provider
    ? COMPUTE_PROVIDERS[provider].icon
    : undefined}
  {@const regionLabel = block.heading?.label ?? ''}
  {@const shown = fieldsOf(group).filter(
    (key) => !comparison || showAllValues || REGIONAL_FIELDS.includes(key),
  )}
  <span class="flex items-center gap-2 text-sm font-medium">
    {#if ProviderIcon}
      <span
        class="flex h-6 w-6 items-center justify-center rounded border border-primary"
      >
        <ProviderIcon width={16} height={16} />
      </span>
    {/if}
    {computeProviderLabel(group.providerType)}
  </span>
  <dl class="grid grid-cols-[9rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
    {#each shown as key (key)}
      {@render field(group, key, regionLabel, fieldState(block, key))}
    {/each}
    {#if group.nexusEndpoint}
      <dt class="text-secondary">
        {translate('deployments.details-nexus-endpoint')}
      </dt>
      <dd class="break-all font-mono text-xs leading-5">
        {group.nexusEndpoint}
      </dd>
    {/if}
    {#if group.taskQueueTypes.length}
      <dt class="text-secondary">{translate('deployments.details-serves')}</dt>
      <dd>{group.taskQueueTypes.map(taskQueueTypeLabel).join(', ')}</dd>
    {/if}
  </dl>
{/snippet}

<section
  aria-labelledby="version-details-serverless"
  class="flex flex-col gap-3"
>
  <h3 id="version-details-serverless" class="text-sm font-medium">
    {translate('deployments.details-serverless-workers')}
  </h3>
  {#if !blocks.length}
    <p class="text-sm text-secondary">
      {translate('deployments.details-self-managed')}
    </p>
  {/if}
  {#each blocks as block (block.key)}
    <!-- Regions are peers the reader compares, so each gets a card. A lone
    group has nothing to compare with and stays unboxed. -->
    <Card
      class={[
        'flex flex-col gap-3',
        carded ? 'p-4' : 'border-0 bg-transparent p-0',
        block.kind === 'missing' && 'border-warning bg-surface-warning',
      ]}
    >
      {#if block.heading}
        {@render regionHeading(block.heading)}
      {/if}
      {#if block.kind === 'missing'}
        <div class="flex flex-col gap-1 text-sm">
          <p class="font-medium text-warning">
            {translate('workers.region-not-configured-in', {
              regions: block.heading.label,
            })}
          </p>
          <p>{translate('workers.region-not-configured-tooltip')}</p>
          <Link href={editHref} class="self-start">
            {translate('deployments.details-add-replica')}
          </Link>
        </div>
      {:else if block.comparison}
        {@const inheritsAll = !GROUP_FIELDS.some(
          (key) =>
            !REGIONAL_FIELDS.includes(key) &&
            block.comparison?.differs.has(key),
        )}
        {#if inheritsAll}
          {@render groupBody(block, false)}
          <details class="text-sm">
            <summary class="cursor-pointer">
              <span class="text-secondary">
                {translate('deployments.details-access-and-scaling')}:
              </span>
              {translate('deployments.details-same-as', {
                region: block.comparison.primaryLabel,
              })}
              <span class="text-secondary">
                · {translate('deployments.details-show-values')}
              </span>
            </summary>
            <div class="mt-2 flex flex-col gap-3">
              <dl class="grid grid-cols-[9rem_minmax(0,1fr)] gap-x-3 gap-y-2">
                {#each fieldsOf(block.group).filter((key) => !REGIONAL_FIELDS.includes(key)) as key (key)}
                  {@render field(
                    block.group,
                    key,
                    block.heading?.label ?? '',
                    'value',
                  )}
                {/each}
              </dl>
            </div>
          </details>
        {:else}
          {@render groupBody(block, true)}
        {/if}
      {:else}
        {@render groupBody(block, true)}
      {/if}
    </Card>
  {/each}
</section>
