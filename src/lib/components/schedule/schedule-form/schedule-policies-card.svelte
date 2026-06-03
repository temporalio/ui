<script lang="ts">
  import type { Writable } from 'svelte/store';

  import { fieldProxy } from 'sveltekit-superforms';

  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Drawer from '$lib/holocene/drawer.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import RadioCard from '$lib/holocene/radio-input/radio-card.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';

  import type { ScheduleFormData } from './schema';

  type OverlapPolicy = ScheduleFormData['overlapPolicy'];

  interface Props {
    form: Writable<ScheduleFormData>;
  }

  let { form }: Props = $props();

  let editing = $state(false);

  const overlapPolicyContent: Record<
    OverlapPolicy,
    { label: string; description: string }
  > = {
    Skip: {
      label: 'Skip (Default)',
      description:
        'Workflow Executions are not started when a previously started Workflow Execution started by this schedule is already running.',
    },
    BufferOne: {
      label: 'Buffer One',
      description:
        'Starts the Workflow Execution as soon as the current one completes. Limited to one.',
    },
    BufferAll: {
      label: 'Buffer All',
      description:
        'Allows an unlimited number of Workflows to buffer; Workflows start in order they were added to buffer.',
    },
    CancelOther: {
      label: 'Cancel Other',
      description:
        'Cancels currently running Workflow Execution, starts new one after cancellation completes.',
    },
    TerminateOther: {
      label: 'Terminate Other',
      description:
        'Terminates currently running Workflow Execution, starts new one immediately.',
    },
    AllowAll: {
      label: 'Allow All',
      description:
        'Starts any number of concurrent Workflow Executions; more than one Workflow Execution can run simultaneously.',
    },
  };

  // svelte-ignore state_referenced_locally
  const overlapPolicyStore = fieldProxy(form, 'overlapPolicy');

  const toggleEdit = () => {
    editing = !editing;
  };

  let pauseSchedule = $state(false);
  let triggerImmediately = $state(false);
  let backfillAll = $state(false);

  // svelte-ignore state_referenced_locally
  const pauseOnFailureStore = fieldProxy(form, 'pauseOnFailure');
</script>

<div class="flex flex-col gap-1">
  <h2 class="text-3xl font-medium">Schedule Policies</h2>

  <p class="text-secondary">
    Schedule policies allow you to customize Schedule and Workflow behavior.
    <Link href="https://docs.temporal.io/schedule#policies" newTab>
      Read more about Schedule policies
    </Link>
  </p>
</div>

<Card class="w-full">
  <div class="flex flex-col gap-4">
    <dl
      class="flex flex-col gap-y-4 lg:grid lg:grid-cols-[max-content,1fr] lg:grid-rows-none lg:gap-x-6 lg:gap-y-2"
    >
      <div class="lg:contents">
        <dt class="text-xs text-secondary lg:text-sm">Overlap Policy</dt>
        <dd>
          {overlapPolicyContent[$form.overlapPolicy].label}
        </dd>
      </div>

      <div class="lg:contents">
        <dt class="text-xs text-secondary lg:text-sm">On Start Behavior</dt>
        <dd>Keep state, do not trigger immediately, do not backfill</dd>
      </div>

      <div class="lg:contents">
        <dt class="text-xs text-secondary lg:text-sm">Catchup Window Policy</dt>
        <dd>{$form.catchupWindow || '1 year'}</dd>
      </div>

      <div class="lg:contents">
        <dt class="text-xs text-secondary lg:text-sm">Pause on Failure?</dt>
        <dd>{$form.pauseOnFailure ? 'Yes' : 'No'}</dd>
      </div>

      <div class="lg:contents">
        <dt class="text-xs text-secondary lg:text-sm">Timeouts</dt>
        <dd>Task: 30 seconds, Run: 2 minutes, Execution: 4 hours</dd>
      </div>
    </dl>
    <div class="mt-2">
      <Button variant="secondary" on:click={toggleEdit}
        >Edit Schedule Policies</Button
      >
    </div>
  </div>
  <Drawer
    dark={false}
    position="right"
    open={editing}
    onClick={() => (editing = false)}
    closeButtonLabel="Cancel policy edits"
    class="w-[35.5rem] max-w-full "
  >
    <div class="flex flex-col gap-4 p-4 pt-0">
      <h2 class="text-3xl font-medium">Edit Schedule Policies</h2>
      <fieldset class="flex flex-col gap-4">
        <legend class="contents">
          <hgroup>
            <h3 class="text-2xl font-medium">Overlap Policy</h3>
            <p class="mt-1 text-secondary">
              Define what to do when a Workflow Execution started by this
              Schedule is running when the Schedule is triggered.
            </p>
          </hgroup>
        </legend>
        <RadioGroup name="overlap-policy" group={overlapPolicyStore}>
          {#each Object.entries(overlapPolicyContent) as [value, content] (value)}
            <RadioCard
              id="overlap-policy-{value}"
              value={value as OverlapPolicy}
              label={content.label}
              description={content.description}
              labelContainerClass="border-transparent p-0"
            />
          {/each}
        </RadioGroup>
      </fieldset>

      <fieldset class="flex flex-col gap-4">
        <legend class="contents">
          <hgroup>
            <h3 class="text-2xl font-medium">On Start Behavior</h3>
            <p class="mt-1 text-secondary">
              Define what happens when the Schedule starts.
            </p>
          </hgroup>
        </legend>

        <div class="flex flex-col gap-2">
          <p class="font-medium">On Schedule Start</p>
          <Checkbox
            id="on-start-behavior-pause-schedule"
            label="Pause Schedule"
            description="Schedule will not run if paused. Cannot be used in conjunction with trigger immediately or backfill all actions at once policies."
            checked={pauseSchedule}
            on:change={() => {
              const next = !pauseSchedule;
              pauseSchedule = next;
              if (pauseSchedule) {
                triggerImmediately = false;
                backfillAll = false;
              }
            }}
          />
          <Checkbox
            id="on-start-behavior-trigger-immediately"
            label="Trigger immediately"
            description="Runs the Schedule immediately."
            checked={triggerImmediately}
            disabled={pauseSchedule}
            on:change={() => (triggerImmediately = !triggerImmediately)}
          />
          <Checkbox
            id="on-start-behavior-backfill-all-actions-at-once"
            label="Backfill all actions at once"
            description="Overrides overlap policy for scope of backfill."
            checked={backfillAll}
            disabled={pauseSchedule}
            on:change={() => (backfillAll = !backfillAll)}
          />
        </div>
      </fieldset>

      <fieldset class="flex flex-col gap-4">
        <legend class="contents">
          <hgroup>
            <h3 class="text-2xl font-medium">Pause on failure</h3>
            <p class="mt-1 text-secondary">
              If true, pauses Schedule after any Workflow failure.
            </p>
          </hgroup>
        </legend>
        <RadioGroup name="pause-on-failure" group={pauseOnFailureStore}>
          <RadioInput
            id="pause-on-failure"
            value={true}
            label="Pause on failure"
          />
          <RadioInput
            id="do-not-pause-on-failure"
            value={false}
            label="Do not pause"
          />
        </RadioGroup>
      </fieldset>

      <fieldset class="flex flex-col gap-4">
        <legend class="contents">
          <hgroup>
            <h3 class="text-2xl font-medium">Catchup Window Policy</h3>
            <p class="mt-1 text-secondary">
              Define what happens to actions missed during an outage when the
              service returns.
            </p>
          </hgroup>
        </legend>

        <p>
          Actions skipped due to an outage within the Catchup Window will be
          taken once the service returns. Minimum 10 seconds and maximum 1 year.
        </p>
        <Select id="catchup-window-policy-unit" label="Unit">
          <Option value="month">Month</Option>
          <Option value="day">Day</Option>
          <Option value="hour">Hour</Option>
          <Option value="minute">Minute</Option>
          <Option value="second">Second</Option>
        </Select>

        <Input
          id="catchup-window-policy-value"
          label="Value"
          type="number"
          inputmode="numeric"
          value={$form.catchupWindow}
          min={0}
        >
          {#snippet afterLabel()}
            <Tooltip
              topLeft
              width={250}
              text="Selecting 1 month will default to 31 days. If you wish to select less than 31 days but remain near the month window, use the Day unit."
            >
              <Icon name="square-info" class="h-3 w-3" />
            </Tooltip>
          {/snippet}
        </Input>
      </fieldset>

      <div class="mt-2">
        <Button variant="secondary" on:click={toggleEdit}>Done</Button>
      </div>
    </div>
  </Drawer>
</Card>
