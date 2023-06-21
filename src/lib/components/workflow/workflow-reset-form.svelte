<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { translate } from '$lib/i18n/translate';
  import { ResetReapplyType } from '$lib/models/workflow-actions';
  import { resetEvents } from '$lib/stores/events';

  export let resetReapplyType: ResetReapplyType = ResetReapplyType.Unspecified;
  export let reason: string = '';
  export let eventId: string;

  const resetReapplyTypes = [
    {
      value: ResetReapplyType.Unspecified,
      label: translate('workflows', 'reset-reapply-all'),
    },
    {
      value: ResetReapplyType.Signal,
      label: translate('workflows', 'reset-reapply-signals-only'),
    },
    {
      value: ResetReapplyType.None,
      label: translate('workflows', 'reset-reapply-none'),
    },
  ];
</script>

<div class="flex w-full flex-col gap-4">
  <ul class="w-full rounded border border-primary max-h-40 overflow-y-scroll">
    {#each $resetEvents as event}
      <li
        class="w-full h-10 border-b border-primary last-of-type:border-none hover:bg-gradient-to-br from-blue-100 to-purple-100 bg-fixed first-of-type:rounded-t last-of-type:rounded-b"
      >
        <label
          class="flex flex-row items-center gap-2 cursor-pointer px-4 py-2 h-full w-full"
          for="reset-event-{event.id}"
        >
          <input
            on:click={() => (eventId = event.id)}
            type="radio"
            checked={event.id === eventId}
            name="reset-event-id"
            id="reset-event-{event.id}"
          />
          <p class="grid grid-cols-8">
            <span class="text-gray-500 font-medium col-span-1">
              {event.eventId}
            </span>
            <span class="font-semibold">
              {event.eventType}
            </span>
          </p>
        </label>
      </li>
    {/each}
  </ul>
  <Select
    label={translate('workflows', 'reset-reapply-type-label')}
    id="reset-reapply-type-select"
    bind:value={resetReapplyType}
    testId="workflow-reset-reapply-type-select"
  >
    {#each resetReapplyTypes as { value, label }}
      <Option {value}>
        {label}
      </Option>
    {/each}
  </Select>
  <Input id="reset-reason" bind:value={reason} label={translate('reason')} />
</div>
