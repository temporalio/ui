<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import CloudRunLatencyNotice from './cloud-run-latency-notice.svelte';
  import ComputeProviderPicker from './compute-provider-picker.svelte';

  const { Story } = defineMeta({
    title: 'Workers/Cloud Run Latency Notice',
    component: CloudRunLatencyNotice,
  });
</script>

<Story name="Cloud Run selected" asChild>
  <div class="max-w-[45rem] p-4">
    <ComputeProviderPicker
      provider="cloud-run"
      providers={[{ value: 'lambda' }, { value: 'cloud-run' }]}
    >
      <CloudRunLatencyNotice provider="cloud-run" />
    </ComputeProviderPicker>
  </div>
</Story>
