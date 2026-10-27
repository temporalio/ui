<script lang="ts">
  import { IconFilter, IconInfo } from '$lib/io/icon';
  import { Button } from '$lib/io-ark/button';
  import { Checkbox, CheckboxGroup } from '$lib/io-ark/checkbox';
  import { Popover } from '$lib/io-ark/popover';

  let open = $state(false);
  let draft = $state<string[]>(['Running', 'Failed']);
  let applied = $state<string[]>(['Running', 'Failed']);

  function apply() {
    applied = [...draft];
    open = false;
  }
</script>

<div class="flex flex-wrap items-center gap-6">
  <div class="flex items-center gap-1 text-sm">
    <span>Retry policy: exponential</span>
    <Popover
      title="Retry policy"
      description="How failed activities are retried."
      showArrow
      placement="right"
    >
      {#snippet trigger(props)}
        <Button
          {...props}
          colorScheme="ghost"
          size="xs"
          LeadingIcon={IconInfo}
          aria-label="About the retry policy"
          tracking={false}
        />
      {/snippet}
      <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        <dt class="text-secondary">Initial interval</dt>
        <dd>1s</dd>
        <dt class="text-secondary">Backoff coefficient</dt>
        <dd>2.0</dd>
        <dt class="text-secondary">Maximum attempts</dt>
        <dd>Unlimited</dd>
      </dl>
    </Popover>
  </div>

  <div class="flex items-center gap-3">
    <Popover title="Filter by status" bind:open placement="bottom-start">
      {#snippet trigger(props)}
        <Button
          {...props}
          colorScheme="secondary"
          LeadingIcon={IconFilter}
          tracking={false}>Status</Button
        >
      {/snippet}
      <CheckboxGroup label="Status" labelHidden bind:value={draft}>
        <Checkbox label="Running" value="Running" />
        <Checkbox label="Completed" value="Completed" />
        <Checkbox label="Failed" value="Failed" />
        <Checkbox label="Timed out" value="TimedOut" />
      </CheckboxGroup>
      <div class="mt-4 flex justify-end gap-2">
        <Button colorScheme="ghost" size="sm" onclick={() => (open = false)}
          >Cancel</Button
        >
        <Button size="sm" onclick={apply}>Apply</Button>
      </div>
    </Popover>
    <p role="status" class="text-xs text-secondary">
      Showing {applied.join(', ') || 'all statuses'}
    </p>
  </div>
</div>
