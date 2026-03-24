<script lang="ts">
  import { writable } from 'svelte/store';

  import Badge from '$lib/holocene/badge.svelte';
  import { RadioCard, RadioGroup } from '$lib/holocene/radio-input';
  import { translate } from '$lib/i18n/translate';

  const provider = writable<string>('lambda');
</script>

<RadioGroup name="provider" group={provider}>
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
