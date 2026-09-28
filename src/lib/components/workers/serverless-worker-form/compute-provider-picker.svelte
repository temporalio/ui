<script lang="ts" module>
  export type ProviderPickerLayout = 'cards' | 'summary';
</script>

<script lang="ts">
  import { writable } from 'svelte/store';

  import { type Snippet, untrack } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import RadioCard from '$lib/holocene/radio-input/radio-card.svelte';
  import RadioControl from '$lib/holocene/radio-input/radio-control.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import { formatList } from '$lib/i18n/format-list';
  import { translate } from '$lib/i18n/translate';
  import { Badge } from '$lib/io/badge';
  import { IconAwsColor, type IconComponent, IconGcpColor } from '$lib/io/icon';

  import {
    type ComputeProviderOption,
    type ComputeProviderValue,
    defaultReleaseStage,
  } from './shared';

  interface Props {
    provider?: string;
    providers?: readonly ComputeProviderOption[];
    name?: string;
    /**
     * `cards`: one full-width card per provider. `summary`: only the
     * selected provider, with Change to show the cards.
     */
    layout?: ProviderPickerLayout;
    children?: Snippet;
  }

  let {
    provider = $bindable('lambda'),
    providers,
    name = 'provider',
    layout = 'cards',
    children,
  }: Props = $props();

  const configuredProviders = untrack(() => providers);

  /** Summary layout: the cards are open for choosing another provider. */
  let changing = $state(false);

  // The brand marks, not the monochrome glyphs. These are vendor logos rather
  // than UI icons, so they keep their own colour on either theme.
  const providerIcon: Record<ComputeProviderValue, IconComponent> = {
    lambda: IconAwsColor,
    agentcore: IconAwsColor,
    'cloud-run': IconGcpColor,
  };

  const providerLabel = (value: ComputeProviderValue): string => {
    switch (value) {
      case 'lambda':
        return translate('workers.provider-lambda');
      case 'agentcore':
        return translate('workers.provider-agentcore');
      case 'cloud-run':
        return translate('workers.provider-cloud-run');
    }
  };

  const providerDescription = (value: ComputeProviderValue): string => {
    switch (value) {
      case 'lambda':
        return translate('workers.provider-lambda-description');
      case 'agentcore':
        return translate('workers.provider-agentcore-description');
      case 'cloud-run':
        return translate('workers.provider-cloud-run-description');
    }
  };

  const releaseStageLabel = (option: ComputeProviderOption): string => {
    switch (option.releaseStage ?? defaultReleaseStage[option.value]) {
      case 'public-preview':
        return translate('workers.public-preview');
      case 'pre-release':
        return translate('workers.pre-release');
      case 'generally-available':
        return '';
    }
  };

  /**
   * Every provider, selectable. Self-hosted has no per-account entitlement to
   * express, and a Service that cannot run a provider rejects the Version with
   * a reason, so gating the picker only hides the choice behind a badge that
   * cannot be acted on.
   *
   * A caller that does need to restrict the list passes `providers`, which is
   * how Temporal Cloud offers only the providers matching the Namespace's own
   * cloud.
   */
  const defaultProviders = $derived<ComputeProviderOption[]>([
    { value: 'lambda' },
    { value: 'agentcore' },
    { value: 'cloud-run' },
  ]);

  const resolvedProviders = $derived(configuredProviders ?? defaultProviders);
  const visibleProviders = $derived(
    resolvedProviders.filter((option) => !option.hidden),
  );

  /** Summary layout: the other providers Change offers, for the footer. */
  const otherProviders = $derived(
    visibleProviders.filter(
      (option) => option.value !== provider && !option.disabled,
    ),
  );

  const providerStore = writable(provider);

  $effect(() => {
    providerStore.set(provider);
  });

  $effect(() => {
    return providerStore.subscribe((value) => {
      if (value !== untrack(() => provider)) changing = false;
      provider = value;
    });
  });
</script>

{#snippet releaseBadge(option: ComputeProviderOption)}
  {#if option.disabled && option.disabledReason}
    <Badge size="sm" text={option.disabledReason} />
  {:else if releaseStageLabel(option)}
    <Badge size="sm" text={releaseStageLabel(option)} colorScheme="accent" />
  {/if}
{/snippet}

{#snippet providerRow(option: ComputeProviderOption)}
  {@const ProviderIcon = providerIcon[option.value]}
  <span
    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary bg-surface-primary"
  >
    <ProviderIcon width={32} height={32} />
  </span>
  <span class="flex min-w-0 flex-1 flex-col">
    <span class="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span class="text-sm font-medium">{providerLabel(option.value)}</span>
      {@render releaseBadge(option)}
    </span>
    <span class="text-sm text-secondary">
      {providerDescription(option.value)}
    </span>
  </span>
{/snippet}

{#if layout === 'summary'}
  {@const selected = visibleProviders.find(
    (option) => option.value === provider,
  )}
  {#if !changing && selected}
    <div class="overflow-hidden rounded-lg border border-primary">
      <div class="flex items-center gap-3 p-4">
        {@render providerRow(selected)}
        {#if visibleProviders.length > 1}
          <Button
            variant="tertiary"
            size="sm"
            class="shrink-0"
            onclick={() => (changing = true)}
          >
            {translate('workers.provider-change')}
          </Button>
        {/if}
      </div>
      {#if otherProviders.length}
        <hr class="mx-4 border-primary" />
        <div class="flex items-center gap-2 px-4 py-3">
          <span class="flex shrink-0 items-center">
            {#each otherProviders as option, index (option.value)}
              {@const ProviderIcon = providerIcon[option.value]}
              <span
                class="flex h-5 w-5 items-center justify-center rounded border border-primary bg-surface-primary"
                class:-ml-2={index > 0}
              >
                <ProviderIcon width={16} height={16} />
              </span>
            {/each}
          </span>
          <p class="text-xs text-secondary">
            {translate('workers.provider-also-supports', {
              providers: formatList(
                otherProviders.map((option) => providerLabel(option.value)),
              ),
            })}
          </p>
        </div>
      {/if}
    </div>
  {:else}
    <div
      role="radiogroup"
      aria-label={translate('workers.compute-provider')}
      class="flex flex-col gap-3"
    >
      {#each visibleProviders as option (option.value)}
        <label
          for={`${name}-${option.value}`}
          class="flex cursor-pointer items-center gap-3 rounded-lg border border-primary p-4"
          class:cursor-not-allowed={option.disabled}
          class:opacity-50={option.disabled}
        >
          <RadioControl
            group={providerStore}
            {name}
            value={option.value}
            id={`${name}-${option.value}`}
            disabled={option.disabled}
            class="shrink-0"
          />
          {@render providerRow(option)}
        </label>
      {/each}
    </div>
    <Button
      variant="tertiary"
      size="sm"
      class="mt-3"
      onclick={() => (changing = false)}
    >
      {translate('common.cancel')}
    </Button>
  {/if}
{:else}
  <RadioGroup {name} group={providerStore}>
    {#each visibleProviders as option (option.value)}
      <RadioCard
        value={option.value}
        id={`${name}-${option.value}`}
        label={providerLabel(option.value)}
        description={providerDescription(option.value)}
        disabled={option.disabled}
        labelContainerClass="rounded-lg"
      >
        {#snippet labelBadge()}
          <span>
            {#if option.disabled && option.disabledReason}
              <Badge size="sm" text={option.disabledReason} />
            {:else if releaseStageLabel(option)}
              <Badge
                size="sm"
                text={releaseStageLabel(option)}
                colorScheme="accent"
              />
            {/if}
          </span>
        {/snippet}
        {#snippet icon()}
          {@const ProviderIcon = providerIcon[option.value]}
          <div
            class="flex h-11 w-11 items-center justify-center rounded-lg border border-primary bg-surface-primary"
          >
            <ProviderIcon width={32} height={32} />
          </div>
        {/snippet}
      </RadioCard>
    {/each}
  </RadioGroup>
{/if}
{@render children?.()}
