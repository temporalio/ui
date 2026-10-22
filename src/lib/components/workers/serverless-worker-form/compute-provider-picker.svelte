<script lang="ts">
  import { writable } from 'svelte/store';

  import { type Snippet, untrack } from 'svelte';

  import RadioCard from '$lib/holocene/radio-input/radio-card.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Badge } from '$lib/io/badge';

  import {
    COMPUTE_PROVIDER_VALUES,
    COMPUTE_PROVIDERS,
    type ComputeProviderReleaseStage,
    type ComputeProviderValue,
  } from './compute-providers';
  import { type ComputeProviderOption, defaultReleaseStage } from './shared';

  interface Props {
    provider?: string;
    providers?: readonly ComputeProviderOption[];
    children?: Snippet;
  }

  let { provider = $bindable('lambda'), providers, children }: Props = $props();

  const configuredProviders = untrack(() => providers);

  const providerLabel = (value: ComputeProviderValue): string =>
    translate(COMPUTE_PROVIDERS[value].labelKey);

  const providerDescription = (value: ComputeProviderValue): string =>
    translate(COMPUTE_PROVIDERS[value].descriptionKey);

  const releaseStageOf = (
    option: ComputeProviderOption,
  ): ComputeProviderReleaseStage =>
    option.releaseStage ?? defaultReleaseStage[option.value];

  const releaseStageLabel = (option: ComputeProviderOption): string => {
    switch (releaseStageOf(option)) {
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
  const defaultProviders = $derived<ComputeProviderOption[]>(
    COMPUTE_PROVIDER_VALUES.map((value) => ({ value })),
  );

  const resolvedProviders = $derived(configuredProviders ?? defaultProviders);
  const visibleProviders = $derived(
    resolvedProviders.filter((option) => !option.hidden),
  );

  const providerStore = writable(provider);

  $effect(() => {
    providerStore.set(provider);
  });

  $effect(() => {
    return providerStore.subscribe((value) => {
      provider = value;
    });
  });
</script>

<RadioGroup name="provider" group={providerStore}>
  {#each visibleProviders as option (option.value)}
    <RadioCard
      value={option.value}
      id={`provider-${option.value}`}
      label={providerLabel(option.value)}
      description={providerDescription(option.value)}
      disabled={option.disabled}
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
              data-release-stage={releaseStageOf(option)}
            />
          {/if}
        </span>
      {/snippet}
      {#snippet icon()}
        {@const ProviderIcon = COMPUTE_PROVIDERS[option.value].icon}
        <div
          class="flex h-11 w-11 items-center justify-center rounded border border-primary bg-surface-primary"
        >
          <ProviderIcon width={32} height={32} />
        </div>
      {/snippet}
    </RadioCard>
  {/each}
</RadioGroup>
{@render children?.()}
