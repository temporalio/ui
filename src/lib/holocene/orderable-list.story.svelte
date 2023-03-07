<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  import OrderableList from './orderable-list.svelte';

  let items = [
    { key: 'a', label: 'Item A', locked: true },
    { key: 'b', label: 'Item B', locked: true },
    { key: 'c', label: 'Item C' },
    { key: 'd', label: 'Item D' },
    { key: 'e', label: 'Item E' },
    { key: 'f', label: 'Item F' },
  ];

  let availableItems = [
    { key: '1', label: 'Item 1' },
    { key: '2', label: 'Item 2' },
    { key: '3', label: 'Item 3' },
  ];

  export let Hst: HST;
</script>

<Hst.Story title="orderable list">
  <Hst.Variant title="An orderable list">
    <OrderableList bind:items />
  </Hst.Variant>

  <Hst.Variant title="An orderable list with extra available items">
    <OrderableList bind:items bind:availableItems />
  </Hst.Variant>
</Hst.Story>
