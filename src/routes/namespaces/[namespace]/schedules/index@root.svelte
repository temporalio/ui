<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ params }) {
    const { namespace } = params;

    return {
      props: { namespace },
    };
  };
</script>

<script lang="ts">
  import { scheduleForm } from '$lib/stores/schedules';
  import {
    createSchedule,
    fetchAllSchedules,
  } from '$lib/services/schedule-service';

  import EmptyState from '$lib/components/empty-state.svelte';
  import Pagination from '$lib/components/pagination.svelte';
  import Button from '$holocene/button.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Loading from '$lib/components/loading.svelte';
  import Table from '$lib/components/table/index.svelte';
  import ScheduleRow from '$lib/components/schedule/schedule-row.svelte';

  import { columns } from './_schedule-table-columns';
  import { noop, onMount, tick } from 'svelte/internal';
  import Modal from '$lib/components/modal.svelte';
  import ScheduleForm from '$lib/components/schedule/schedule-form.svelte';
  import Input from '$lib/holocene/input.svelte';

  export let namespace: string;

  $: schedules = fetchAllSchedules(namespace);

  let search = '';
  let showCreateConfirmation = false;

  $: filteredSchedules = (schedules) =>
    search
      ? schedules.filter((schedule) => schedule.scheduleId.includes(search))
      : schedules;

  const errorMessage =
    'Create scheduled actions using our Public API or TCTL (CLI).';

  const handleClick = async () => {
    const body = $scheduleForm;
    if (
      body.schedule.spec.interval.interval &&
      body.schedule.spec.interval.phase
    ) {
      body.schedule.spec.interval = [$scheduleForm.schedule.spec.interval];
      body.schedule.spec.calendar = [];
    } else {
      body.schedule.spec.interval = [];
      body.schedule.spec.calendar = [$scheduleForm.schedule.spec.calendar];
    }
    await createSchedule({
      namespace,
      body,
    });
    showCreateConfirmation = false;
    schedules = fetchAllSchedules(namespace);
  };
</script>

<div class="flex flex-row justify-between">
  <h2 class="text-2xl">Schedules <Badge type="alpha">Alpha</Badge></h2>
  <Button class="h-12" primary on:click={() => (showCreateConfirmation = true)}
    >Create</Button
  >
</div>
<div class="z-20 w-full xl:w-1/2">
  <Input
    icon="search"
    id="schedule-name-filter"
    label="Schedule Name"
    bind:value={search}
    on:input={(e) => (search = e.target.value)}
    on:submit={noop}
  />
</div>

{#await schedules}
  <Loading />
{:then { schedules }}
  {#if schedules.length}
    <Pagination items={filteredSchedules(schedules)} let:visibleItems>
      <Table {columns}>
        {#each visibleItems as schedule}
          <ScheduleRow {schedule} {namespace} />
        {/each}
      </Table>
    </Pagination>
  {:else}
    <div class="my-12 flex flex-col justify-start items-center gap-2">
      <EmptyState title={'No Schedules Found'} content={errorMessage} />
      <Button primary as="anchor">Get Started With Docs</Button>
    </div>
  {/if}
  <Modal
    open={showCreateConfirmation}
    confirmText="Create"
    confirmType="primary"
    large
    on:cancelModal={() => (showCreateConfirmation = false)}
    on:confirmModal={() => handleClick()}
  >
    <h3 slot="title">Create Schedule</h3>
    <div slot="content">
      <ScheduleForm />
    </div>
  </Modal>
{/await}

<style lang="postcss">
  .row {
    @apply block items-center border-b-2 p-2 text-sm no-underline last-of-type:border-b-0 xl:table-row xl:text-base;
  }

  .row:hover {
    @apply bg-gray-50;
  }

  .cell {
    @apply border-gray-700 p-2 text-left xl:table-cell xl:border-b-2;
  }

  .table-link {
    @apply group-hover:text-blue-700 group-hover:underline group-hover:decoration-blue-700;
  }

  .row:last-of-type .cell {
    @apply border-b-0 first-of-type:rounded-bl-lg  last-of-type:rounded-br-lg;
  }
</style>
