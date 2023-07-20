<script lang="ts">
  import { onMount } from "svelte";
  import { deleteSettings, fetchFlowSettings, updateFlowSettings } from "$lib/services/settings-service";
  import { JSONEditor } from "svelte-jsoneditor";
  import Table from "$lib/holocene/table/table.svelte";
  import TableHeaderRow from "$lib/holocene/table/table-header-row.svelte";
  import TableRow from "$lib/holocene/table/table-row.svelte";
  import { searchAttributes } from "$lib/stores/search-attributes";
  import { toaster } from "$lib/stores/toaster";

  type ConfigResultType = {
    wfConfig: string;
    wfName: string;
  }

  type ConfigResultTypeWithDecodedStr = ConfigResultType & {
    config: any
  }

  let selected = {} as ConfigResultType;
  // let content = {};
  let content: { json: any, text?: string } = {};
  $: configurations = [];

  onMount(() => {
    fetchFlowSettings().then((result: ConfigResultType[]) => {
      configurations = result;
    });
  });

  const setSelected = (i: number) => {
    selected = configurations[i];
    content.json = JSON.parse(atob(selected.wfConfig));
  };

  function handleChange(updatedContent) {
    content = updatedContent;
  }

  function handleSave() {
    const wfConfig = btoa(JSON.stringify(content.json));
    selected.wfConfig = wfConfig;
    updateFlowSettings(selected).then((response) => {
      toaster.push({
        message: "Update was successful",
        variant: "success"
      });
    }).catch(error => toaster.push({
      message: "Something went wrong",
      variant: "error"
    }));
  }

  async function deleteConfiguration(name: string) {
    deleteSettings(name).then(res => {
      toaster.push({
        message: `Configuration for ${name.toUpperCase()} has been deleted`,
        variant: "success"
      });

      fetchFlowSettings().then(result => configurations = result)
    }).catch(error => {
      toaster.push({
        message: "Something went wrong",
        variant: "error"
      });
    });
  }
</script>

<header class="mb-2 flex justify-between">
  <div>
    <h1 class="text-2xl">Settings</h1>
  </div>
</header>

<div class="flex">
  <div class="flex-1 bg-blue min-h-100 mr-1">
    <Table class="w-full" variant="fancy">
      <TableHeaderRow slot="headers">
        <th>Workflow Name</th>
        <th></th>
      </TableHeaderRow>
      {#each configurations as configuration, i}
        <TableRow>
          <td>{configuration.wfName.toUpperCase()}</td>
          <td>
            <button class="bg-black text-white px-4 py-2" on:click={() => setSelected(i)}>Edit</button>
            <button class="bg-red-500 text-white px-4 py-2" on:click={() => deleteConfiguration(configuration.wfName)}>
              Delete
            </button>
          </td>
        </TableRow>
      {/each}
    </Table>
  </div>

  <div class="flex-1 ml-1">
    {#if selected.wfName}
      <div class="w-full bg-gray-200 rounded p-2 flex-col">
        <h1>{selected.wfName.toUpperCase()}</h1>
        <div class="mb-2">
          <!--          <textarea p-2>{JSON.stringify(JSON.parse(atob(selected.wfConfig)), null, 4)}</textarea>-->
          <JSONEditor {content} onChange={handleChange} />
        </div>

        <button class="bg-black text-white px-4 py-2" on:click={handleSave}>
          Update
        </button>
      </div>
    {/if}
  </div>
</div>