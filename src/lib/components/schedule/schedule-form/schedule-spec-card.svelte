<script lang="ts">
  import type { Writable } from 'svelte/store';

  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Link from '$lib/holocene/link.svelte';

  import type { ScheduleFormData } from './schema';
  import { DEFAULT_SPEC_ITEM } from './schema';

  import ScheduleSpecItem from './schedule-spec-item.svelte';

  interface Props {
    form: Writable<ScheduleFormData>;
  }

  let { form }: Props = $props();

  const specs = $derived($form.specs);

  // svelte-ignore state_referenced_locally
  let activeIndex = $state(specs.length - 1);

  const addSpec = () => {
    $form.specs = [...$form.specs, { ...DEFAULT_SPEC_ITEM }];
    activeIndex = $form.specs.length - 1;
  };

  const removeSpec = (index: number) => {
    $form.specs = $form.specs.filter((_, i) => i !== index);
    if (activeIndex >= $form.specs.length) {
      activeIndex = $form.specs.length - 1;
    } else if (activeIndex > index) {
      activeIndex = activeIndex - 1;
    }
  };
</script>

<Card class="w-full">
  <h2 class="text-lg font-semibold">Schedule Spec</h2>
  <div class="mt-4 flex flex-col gap-4">
    <p class="text-sm text-secondary">
      Define rules for when this Workflow should run. You can add as many
      Schedule Specifications as you need to comprehensively describe the
      schedule. Specs can be calendar-based, cron-based, or interval-based.
      <Link href="https://docs.temporal.io/schedules#spec" newTab>
        Learn more about the Schedule Spec
      </Link>
    </p>

    <div class="flex flex-col gap-4">
      {#each specs as _, i (i)}
        <ScheduleSpecItem
          {form}
          index={i}
          expanded={activeIndex === i}
          onExpand={() => (activeIndex = i)}
          onRemove={() => removeSpec(i)}
          canRemove={specs.length > 1}
        />
      {/each}
    </div>

    <div>
      <Button variant="secondary" on:click={addSpec}>
        + Add another schedule spec
      </Button>
    </div>
  </div>
</Card>
