<script lang="ts">
  import type { SuperForm } from 'sveltekit-superforms';

  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Link from '$lib/holocene/link.svelte';
  import type { FullSchedule } from '$lib/types/schedule';

  import type { ScheduleFormData } from './schema';
  import { SPEC_ITEM_NO_TYPE } from './schema';

  import ScheduleSpecItem from './schedule-spec-item.svelte';

  interface Props {
    form: SuperForm<ScheduleFormData>['form'];
    errors: SuperForm<ScheduleFormData>['errors'];
    schedule?: FullSchedule | null;
  }

  let { form, errors, schedule = null }: Props = $props();

  // svelte-ignore state_referenced_locally
  let expandedIndex: number | null = $state(schedule ? null : 0);

  const addSpec = () => {
    $form.specs = [...$form.specs, { ...SPEC_ITEM_NO_TYPE }];
    expandedIndex = $form.specs.length - 1;
  };

  const removeSpec = (index: number) => {
    $form.specs = $form.specs.filter((_, i) => i !== index);

    if (typeof expandedIndex !== 'number') {
      // no spec was expanded
      return;
    }

    if (expandedIndex === index) {
      // expanded spec was removed
      expandedIndex = null;
      return;
    }

    if (expandedIndex > index) {
      // expanded spec came after removed spec
      expandedIndex = expandedIndex - 1;
      return;
    }

    // clamp index to new spec list size
    expandedIndex = Math.min(expandedIndex, $form.specs.length - 1);
  };
</script>

<Card class="w-full">
  <h2 class="text-2xl font-medium">Schedule Spec</h2>
  <div class="mt-4 flex flex-col gap-4">
    <p class="text-sm text-secondary">
      Define rules for when this Workflow should run. You can add as many
      Schedule Specifications as you need to comprehensively describe the
      schedule. Specs can be calendar-based, cron-based, or interval-based.
      <Link href="https://docs.temporal.io/schedule#spec" newTab>
        Learn more about the Schedule Spec
      </Link>
    </p>

    <div class="flex flex-col gap-4">
      {#each $form.specs as _, i (i)}
        <ScheduleSpecItem
          {form}
          index={i}
          expanded={expandedIndex === i}
          canRemove={$form.specs.length > 1}
          onRemove={() => removeSpec(i)}
          {errors}
        />
      {/each}
    </div>

    <div>
      <Button variant="secondary" on:click={addSpec}>
        + {$form.specs.length > 0
          ? 'Add another schedule spec'
          : 'Add a schedule spec'}
      </Button>
    </div>
  </div>
</Card>
