<script lang="ts">
  import { writable } from 'svelte/store';

  import { type Snippet, untrack } from 'svelte';

  import Badge from '$lib/holocene/badge.svelte';
  import RadioCard from '$lib/holocene/radio-input/radio-card.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconAws, type IconComponent, IconGcp } from '$lib/io/icon';
  import { hasCapability } from '$lib/utilities/has-capability.svelte';

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
    'cloud-run': IconGcp,
  };

  const providerLabel = (value: ComputeProviderValue): string => {
    switch (value) {
      case 'lambda':
        return translate('workers.provider-lambda');
      case 'cloud-run':
        return translate('workers.provider-cloud-run');
    }
  };

  const providerDescription = (value: ComputeProviderValue): string => {
    switch (value) {
      case 'lambda':
        return translate('workers.provider-lambda-description');
      case 'cloud-run':
        return translate('workers.provider-cloud-run-description');
    }
  };

  const badgeClass = 'px-1.5 py-0 text-xs font-normal leading-5';

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

  const cloudRunCapable = $derived(
    hasCapability('serverScaledProviderCloudRun'),
  );

  const defaultProviders = $derived<ComputeProviderOption[]>([
    { value: 'lambda' },
    {
      value: 'cloud-run',
      disabled: !cloudRunCapable,
      disabledReason: cloudRunCapable
        ? undefined
        : translate('workers.coming-soon'),
    },
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
            <Badge type="secondary" class={badgeClass}>
              {option.disabledReason}
            </Badge>
          {:else if releaseStageLabel(option)}
            <Badge type="secondary" class={badgeClass}>
              {releaseStageLabel(option)}
            </Badge>
          {/if}
        </span>
      {/snippet}
      {#snippet icon()}
        {@const ProviderIcon = providerIcon[option.value]}
        <div
          class="bg-surface-primary flex h-11 w-11 items-center justify-center rounded-none border border-subtle"
        >
          <ProviderIcon width={32} height={32} />
        </div>
      {/snippet}
    </RadioCard>
  {/each}
</RadioGroup>
{@render children?.()}
