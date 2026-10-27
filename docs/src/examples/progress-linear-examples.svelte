<script lang="ts">
  import { ProgressLinear } from '$lib/io-ark/progress';

  const formatWorkflows = ({ value }: { value: number | null }) =>
    `${(value ?? 0).toLocaleString()} of 1,000 workflows`;
  const formatAttempts = ({ value }: { value: number | null }) =>
    `${value} of 10 attempts`;
</script>

<div class="flex max-w-lg flex-col gap-6">
  <ProgressLinear
    label="Batch terminate"
    value={342}
    max={1000}
    formatValue={formatWorkflows}
  />
  <ProgressLinear
    label="Activity retries used"
    value={8}
    max={10}
    colorScheme="warning"
    formatValue={formatAttempts}
  />
  <ProgressLinear
    label="Namespace storage"
    value={97}
    colorScheme="danger"
    size="sm"
  />
  <ProgressLinear label="Loading event history" value={null} />
  <ProgressLinear
    label="Replay complete"
    value={100}
    colorScheme="success"
    size="sm"
  />
</div>
