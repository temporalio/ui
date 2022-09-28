<script lang="ts">
  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Sort from './sort.svelte';

  export let workflowIdFilter = [];
  export let sorts = [];
  export let onChange: () => void;

  let value = '';

  $: {
    if (value) {
      const filter = {
        filterType: 'WorkflowId',
        value,
        conditional: '=',
        operator: '',
        parenthesis: '',
      };
      workflowIdFilter = [filter];
    } else {
      workflowIdFilter = [];
    }

    onChange();
  }
</script>

<DropdownMenu {value} keepOpen left>
  <svelte:fragment slot="label">Workflow Id</svelte:fragment>
  <div class="flex w-96 flex-col gap-2 p-2">
    <Input
      icon="search"
      id="workflowId"
      placeholder="Workflow Id"
      class="flex items-center px-2 transition-all hover:cursor-pointer"
      autoFocus
      bind:value
    />
    <Sort type="WorkflowId" bind:sorts {onChange} />
  </div>
</DropdownMenu>
