<script lang="ts">
  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Sort from './sort.svelte';

  export let workflowTypeFilter = [];
  export let sorts = [];
  export let onChange: () => void;

  let value = '';

  $: {
    if (value) {
      const filter = {
        filterType: 'WorkflowType',
        value,
        conditional: '=',
        operator: '',
        parenthesis: '',
      };
      workflowTypeFilter = [filter];
    } else {
      workflowTypeFilter = [];
    }

    onChange();
  }
</script>

<DropdownMenu {value} keepOpen left size="small">
  <div class="flex w-96 flex-col gap-2 p-2">
    <Input
      icon="search"
      id="workflowType"
      placeholder="Workflow Type"
      class="flex items-center px-2 transition-all hover:cursor-pointer"
      autoFocus
      bind:value
    />
    <Sort type="WorkflowType" bind:sorts {onChange} />
  </div>
</DropdownMenu>
