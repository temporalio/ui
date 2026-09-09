<script lang="ts">
  import { writable } from 'svelte/store';

  import { type Snippet, untrack } from 'svelte';

  import RadioCard from '$lib/holocene/radio-input/radio-card.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Badge } from '$lib/io/badge';
  import { IconAws, type IconComponent, IconGcp } from '$lib/io/icon';

  import {
    type ComputeProviderOption,
    type ComputeProviderValue,
    defaultReleaseStage,
  } from './shared';

  interface Props {
    provider?: string;
    providers?: readonly ComputeProviderOption[];
    children?: Snippet;
  }

  let { provider = $bindable('lambda'), providers, children }: Props = $props();

  const configuredProviders = untrack(() => providers);

  const providerIcon: Record<ComputeProviderValue, IconComponent> = {
    lambda: IconAws,
    agentcore: IconAws,
    'cloud-run': IconGcp,
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
            <Badge text={option.disabledReason} />
          {:else if releaseStageLabel(option)}
            <Badge text={releaseStageLabel(option)} colorScheme="accent" />
          {/if}
        </span>
      {/snippet}
      {#snippet icon()}
        {@const ProviderIcon = providerIcon[option.value]}
        <div
          class="flex h-11 w-11 items-center justify-center rounded-none border border-primary bg-surface-primary"
        >
          <ProviderIcon width={32} height={32} />
        </div>
      {/snippet}
    </RadioCard>
  {/each}
</RadioGroup>
{@render children?.()}
