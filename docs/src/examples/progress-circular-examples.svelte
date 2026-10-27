<script lang="ts">
  import { ProgressCircular } from '$lib/io-ark/progress';

  const formatWorkers = ({ value }: { value: number | null }) => `${value}/8`;
</script>

<div class="flex flex-col gap-6">
  <div
    class="flex max-w-md items-center justify-between gap-4 rounded border border-primary p-4"
  >
    <div>
      <p class="text-sm font-medium">Deployment orders-v42</p>
      <p class="text-xs text-secondary">Rolling out to orders-task-queue</p>
    </div>
    <ProgressCircular
      label="Workers upgraded"
      labelHidden
      value={6}
      max={8}
      showValue
      formatValue={formatWorkers}
    />
  </div>
  <div class="flex flex-wrap items-end gap-8">
    <ProgressCircular label="Small" size="sm" value={40} />
    <ProgressCircular label="Medium" value={65} showValue />
    <ProgressCircular
      label="Large"
      size="lg"
      value={90}
      showValue
      colorScheme="success"
    />
    <ProgressCircular label="Starting workers" value={null} />
  </div>
</div>
