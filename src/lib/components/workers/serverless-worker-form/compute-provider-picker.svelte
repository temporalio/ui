<script lang="ts">
  import { writable } from 'svelte/store';

  import Badge from '$lib/holocene/badge.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import RadioCard from '$lib/holocene/radio-input/radio-card.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    provider?: string;
  }

  let { provider = $bindable('lambda') }: Props = $props();

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
  <RadioCard
    value="lambda"
    id="provider-lambda"
    label={translate('workers.provider-lambda')}
    description={translate('workers.provider-lambda-description')}
  >
    <div
      slot="icon"
      class="bg-surface-primary flex h-11 w-11 items-center justify-center rounded-none border border-subtle"
    >
      <Icon name="aws" width={32} height={32} />
    </div>
    <slot />
  </RadioCard>

  <RadioCard
    value="cloud-run"
    id="provider-cloud-run"
    label={translate('workers.provider-cloud-run')}
    description={translate('workers.provider-cloud-run-description')}
    disabled
  >
    <Badge slot="label-badge" type="subtle"
      >{translate('workers.coming-soon')}</Badge
    >
    <div
      slot="icon"
      class="bg-surface-primary flex h-11 w-11 items-center justify-center rounded-none border border-subtle"
    >
      <Icon name="gcp" width={32} height={32} />
    </div>
  </RadioCard>
</RadioGroup>
