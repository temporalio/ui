<!-- Which Cloud Run worker pool runs the Worker. -->
<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconExternalLinkOptical } from '$lib/io/icon';

  import type { ComputeSectionProps } from './types';
  import { GCP_REGIONS } from '../gcp-regions';

  let {
    values = $bindable(),
    errors,
    fieldId,
    deployRegions = [...GCP_REGIONS],
  }: ComputeSectionProps = $props();
</script>

<div class="flex flex-col gap-4">
  <Input
    bind:value={values.gcpProject}
    id={fieldId('gcpProject')}
    name={fieldId('gcpProject')}
    label={translate('workers.gcp-project-label')}
    hintText={errors.gcpProject?.[0]}
    error={!!errors.gcpProject?.[0]}
    placeholder={translate('workers.gcp-project-placeholder')}
    required
  />
  <Combobox
    bind:value={values.gcpRegion}
    id={fieldId('gcpRegion')}
    name={fieldId('gcpRegion')}
    label={translate('workers.gcp-region-label')}
    hintText={translate('workers.gcp-region-hint')}
    placeholder={translate('workers.gcp-region-placeholder')}
    options={deployRegions}
    noResultsText={translate('common.no-results')}
    valid={!errors.gcpRegion?.[0]}
    error={errors.gcpRegion?.[0]}
    allowCustomValue
    showChevron
    required
  />
  <div class="flex flex-wrap items-start gap-4 [&>:not(:first-child)]:mt-7">
    <Input
      bind:value={values.gcpWorkerPool}
      id={fieldId('gcpWorkerPool')}
      name={fieldId('gcpWorkerPool')}
      label={translate('workers.gcp-worker-pool-label')}
      hintText={errors.gcpWorkerPool?.[0]}
      error={!!errors.gcpWorkerPool?.[0]}
      placeholder={translate('workers.gcp-worker-pool-placeholder')}
      required
      class="flex-1"
    />
    <Button
      variant="tertiary"
      type="button"
      href="https://console.cloud.google.com/run/worker-pools"
      target="_blank"
      TrailingIcon={IconExternalLinkOptical}
    >
      {translate('workers.open-cloud-run-console')}
    </Button>
  </div>
</div>
