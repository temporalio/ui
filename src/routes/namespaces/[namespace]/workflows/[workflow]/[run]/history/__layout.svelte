<script lang="ts">
  import {
    faCode,
    faDownload,
    faLayerGroup,
    faStream,
  } from '@fortawesome/free-solid-svg-icons';

  import Option from '$lib/components/select/option.svelte';
  import ToggleButton from '$lib/components/toggle-button.svelte';
  import ToggleButtons from '$lib/components/toggle-buttons.svelte';
  import FilterSelect from '$lib/components/select/filter-select.svelte';

  let category: EventTypeCategory = null;
</script>

<section class="flex flex-col gap-4 h-full">
  <h3 class="text-lg font-semibold">Event History</h3>
  <nav class="flex gap-4 justify-between">
    <div>
      <FilterSelect parameter="event-type" bind:value={category}>
        <Option value={null}>All</Option>
        <Option value="activity">Activity</Option>
        <Option value="command">Command</Option>
        <Option value="signal">Signal</Option>
        <Option value="timer">Timer</Option>
        <Option value="child-workflow">Child Workflow</Option>
        <Option value="workflow">Workflow</Option>
      </FilterSelect>
    </div>
    <div class="flex gap-4">
      <ToggleButtons>
        <ToggleButton icon={faStream} href="full" />
        <ToggleButton icon={faLayerGroup} href="compact" />
        <ToggleButton icon={faCode} href="json" />
      </ToggleButtons>
      <ToggleButton icon={faDownload} href="#no-implemented" />
    </div>
  </nav>
  <slot />
</section>
