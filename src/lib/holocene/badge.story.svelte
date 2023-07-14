<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  
  import Badge from './badge.svelte';

  export let Hst: HST;
  let count = 1;
</script>

<Hst.Story>
  <Hst.Variant title="A Default Badge">
    <Badge>Default</Badge>
  </Hst.Variant>

  <Hst.Variant title="An Alpha Badge">
    <Badge type="alpha">Alpha</Badge>
  </Hst.Variant>

  <Hst.Variant title="A Beta Badge">
    <Badge type="beta">Beta</Badge>
  </Hst.Variant>

  <Hst.Variant title="A Warning Badge">
    <Badge type="warning">Warning</Badge>
  </Hst.Variant>

  <Hst.Variant title="A Badge with a Count">
    <Badge type="count">{count}</Badge>
  </Hst.Variant>

  <svelte:fragment slot="controls">
    <Hst.Number title="Count" bind:value={count} />
  </svelte:fragment>
</Hst.Story>
