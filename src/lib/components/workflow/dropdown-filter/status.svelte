<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';
  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';

  export let value = '';
  export let onChange: (value: string) => void;

  const statuses = {
    All: 'All',
    Running: 'Running',
    'Timed Out': 'TimedOut',
    Completed: 'Completed',
    Failed: 'Failed',
    'Continued as New': 'ContinuedAsNew',
    Canceled: 'Canceled',
    Terminated: 'Terminated',
  };

  const onClick = (_value: string) => {
    value = _value;
    onChange(_value);
  };
</script>

<DropdownMenu {value} left size="small">
  <div class="flex flex-col gap-2">
    {#each Object.entries(statuses) as [label, _value] (_value)}
      <div
        class="flex items-center px-2 transition-all hover:scale-[103%] hover:cursor-pointer"
        on:click={() => onClick(_value)}
      >
        <div class="w-6">
          {#if value === _value || (!value && _value === 'All')}
            <Icon
              class="stroke-2 text-gray-900"
              name="checkmark"
              width={20}
              height={20}
            />
          {/if}
        </div>
        <div class="flex h-6 items-center">
          {#if _value === 'All'}
            All Statuses
          {:else}
            <WorkflowStatus status={_value} />
          {/if}
        </div>
      </div>
    {/each}
  </div>
</DropdownMenu>

<style lang="postcss">
  .active {
    @apply bg-gray-300;
  }
</style>
