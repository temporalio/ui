<script lang="ts">
  import { writable } from 'svelte/store';

  import Badge from '$lib/holocene/badge.svelte';
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

  providerStore.subscribe((value) => {
    provider = value;
  });
</script>

<RadioGroup name="provider" group={providerStore}>
  <RadioCard
    value="lambda"
    id="provider-lambda"
    label={translate('workers.provider-lambda')}
    description={translate('workers.provider-lambda-description')}
  >
    <Badge slot="badge" type="primary">Enabled</Badge>
    <slot />
  </RadioCard>

  <RadioCard
    value="cloud-run"
    id="provider-cloud-run"
    label={translate('workers.provider-cloud-run')}
    description={translate('workers.provider-cloud-run-description')}
    disabled
  >
    <Badge slot="badge" type="subtle">{translate('workers.coming-soon')}</Badge>
  </RadioCard>

  <RadioCard
    value="vercel"
    id="provider-vercel"
    label={translate('workers.provider-vercel')}
    description={translate('workers.provider-vercel-description')}
    disabled
  >
    <Badge slot="badge" type="subtle">{translate('workers.coming-soon')}</Badge>
  </RadioCard>
</RadioGroup>
