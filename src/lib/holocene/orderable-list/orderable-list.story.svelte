<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  import OrderableListItem from './orderable-list-item.svelte';
  import OrderableList from './orderable-list.svelte';

  let items = [
    { label: 'Item A', pinned: true },
    { label: 'Item B', pinned: true },
    { label: 'Item C' },
    { label: 'Item D' },
    { label: 'Item E' },
    { label: 'Item F' },
  ];

  export let Hst: HST;
</script>

<Hst.Story title="orderable list">
  <Hst.Variant title="An orderable list">
    <OrderableList>
      {#each items as item, index}
        <OrderableListItem pinned={item.pinned} {index}>
          {item.label}
        </OrderableListItem>
      {/each}
    </OrderableList>
  </Hst.Variant>
</Hst.Story>
