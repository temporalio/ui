<script lang="ts">
  import { page } from '$app/stores';
  import PageTitle from '$lib/components/page-title.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import HoverCard from '$lib/holocene/hover-card.svelte';
  import { userSettings } from '$lib/stores/user-settings';
  import {
    CoreUserSettings,
    CoreUserEmbeddedContent,
  } from '$lib/models/core-user';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import DropdownButton from '$lib/holocene/dropdown-button/dropdown-button.svelte';
  import { capitalize } from '$lib/utilities/format-camel-case';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import { timeFormat } from '$lib/stores/time-format';

  let activeTemplate = 'developer';

  const getUserSettings = (option) => {
    const setting = $userSettings[option];
    if (setting === false) return false;
    return true;
  };

  const setUserSetting = (option) => {
    const setting = $userSettings[option];
    if (setting === false) {
      $userSettings[option] = true;
    } else {
      $userSettings[option] = false;
    }
  };

  const widgets = [
    { label: 'Show Summary', option: CoreUserSettings.WORKFLOW_SUMMARY },
    {
      label: 'Show Relationships',
      option: CoreUserSettings.WORKFLOW_RELATIONSHIPS,
    },
    {
      label: 'Show Pending Activities',
      option: CoreUserSettings.WORKFLOW_PENDING_ACTIVITIES,
    },
    {
      label: 'Show Input and Results',
      option: CoreUserSettings.WORKFLOW_INPUT_AND_RESULTS,
    },
    // {
    //   label: 'Decode JSON View Payloads',
    //   option: CoreUserSettings.WORKFLOW_DECODE_JSON_VIEW,
    // },
  ];
</script>

<PageTitle title="Settings" url={$page.url.href} />
<div class="flex flex-col gap-8">
  <h1 data-cy="namespace-selector-title" class="text-2xl">Settings</h1>
  <section class="flex flex-col gap-4">
    <h2 class="text-xl">Templates</h2>
    <div class="flex gap-8">
      <HoverCard title="Learner" active={activeTemplate === 'developer'}>
        <p>Let's get started using Temporal</p>
      </HoverCard>
      <HoverCard title="Local Developer">
        <p>Writing & Debugging</p>
      </HoverCard>
      <HoverCard title="Business user, customer service">
        <p>Non-technical view</p>
      </HoverCard>
      <HoverCard title="Dev Operator">
        <p>Namespace management (technical user, on-call)</p>
      </HoverCard>
      <HoverCard title="Sys Operator">
        <p>Cluster management</p>
      </HoverCard>
    </div>
  </section>
  <section class="flex flex-col gap-4">
    <h2 class="text-xl">Global</h2>
    <Table variant="fancy">
      <TableHeaderRow>
        <td>Option</td>
      </TableHeaderRow>
      <TableRow>
        <td class="flex items-center gap-8"
          >Time Preference
          <DropdownButton
            id="timezone"
            label={capitalize($timeFormat)}
            icon="clock"
          >
            <MenuItem on:click={() => ($timeFormat = 'relative')}
              >Relative</MenuItem
            >
            <MenuItem on:click={() => ($timeFormat = 'UTC')}>UTC</MenuItem>
            <MenuItem on:click={() => ($timeFormat = 'local')}>Local</MenuItem>
          </DropdownButton>
        </td>
      </TableRow>
    </Table>
  </section>

  <section class="flex flex-col gap-4">
    <h2 class="text-xl">Layouts</h2>
    <Table variant="fancy">
      <TableHeaderRow>
        <td>Page</td>
        <td>Layout</td>
      </TableHeaderRow>
      <TableRow>
        <td><h3>Workflows List</h3></td>
        <td class="flex gap-4"
          ><Button active>Classic View</Button><Button>Dashboard View</Button
          ><Button>Feed View</Button></td
        >
      </TableRow>
    </Table>
  </section>
  <section class="flex flex-col gap-4">
    <h2 class="text-xl">Widgets</h2>
    <Table variant="fancy">
      <TableHeaderRow>
        <td>Page</td>
        <td>Widget</td>
      </TableHeaderRow>
      <TableRow>
        <td><h3>Workflows List</h3></td>
        <td>
          <label for={CoreUserSettings.WORKFLOWS_AUTOREFRESH} class="label">
            <ToggleSwitch
              id={CoreUserSettings.WORKFLOWS_AUTOREFRESH}
              checked={getUserSettings(CoreUserSettings.WORKFLOWS_AUTOREFRESH)}
              on:change={() =>
                setUserSetting(CoreUserSettings.WORKFLOWS_AUTOREFRESH)}
            />Auto refresh enabled
          </label>
        </td>
      </TableRow>
      <TableRow>
        <td><h3>Workflow Execution</h3></td>
        <td>
          {#each widgets as widget}
            <label for={widget.label} class="label">
              <ToggleSwitch
                id={widget.label}
                checked={getUserSettings(widget.option)}
                on:change={() => setUserSetting(widget.option)}
              />{widget.label}
            </label>
          {/each}
        </td>
      </TableRow>
    </Table>
  </section>
  <section class="flex flex-col gap-4">
    <h2 class="text-xl">Embedded Content</h2>
    <Table variant="fancy">
      <TableHeaderRow>
        <td>Page</td>
        <td>Src</td>
      </TableHeaderRow>
      <TableRow>
        <td><h3>Workflows List</h3></td>
        <td class="flex flex-col gap-2">
          <Input
            id={CoreUserEmbeddedContent.WORKFLOWS.TOP}
            label="Top"
            bind:value={$userSettings['WORKFLOWS.TOP']}
          />
          <Input
            id={CoreUserEmbeddedContent.WORKFLOWS.LEFT}
            label="Left"
            bind:value={$userSettings['WORKFLOWS.LEFT']}
          />
          <Input
            id={CoreUserEmbeddedContent.WORKFLOWS.RIGHT}
            label="Right"
            bind:value={$userSettings['WORKFLOWS.RIGHT']}
          />
          <Input
            id={CoreUserEmbeddedContent.WORKFLOWS.BOTTOM}
            label="Bottom"
            bind:value={$userSettings['WORKFLOWS.BOTTOM']}
          />
        </td>
      </TableRow>
      <TableRow>
        <td><h3>Workflow Execution</h3></td>
        <td class="flex flex-col gap-2">
          <Input
            id={CoreUserEmbeddedContent.WORKFLOW.TOP}
            label="Top"
            bind:value={$userSettings['WORKFLOW.TOP']}
          />
          <Input
            id={CoreUserEmbeddedContent.WORKFLOW.LEFT}
            label="Left"
            bind:value={$userSettings['WORKFLOW.LEFT']}
          />
          <Input
            id={CoreUserEmbeddedContent.WORKFLOW.RIGHT}
            label="Right"
            bind:value={$userSettings['WORKFLOW.RIGHT']}
          />
          <Input
            id={CoreUserEmbeddedContent.WORKFLOW.BOTTOM}
            label="Bottom"
            bind:value={$userSettings['WORKFLOW.BOTTOM']}
          />
        </td>
      </TableRow>
    </Table>
  </section>
</div>

<style lang="postcss">
  .label {
    @apply flex items-center gap-4 font-secondary text-sm;
  }
</style>
