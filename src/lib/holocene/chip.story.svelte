<script lang="ts">
  import Chip from '$lib/holocene/chip.svelte';
  import type { Hst as HST } from '@histoire/plugin-svelte';

  export let Hst: HST;

  let value = 'lucille@temporal.io';
</script>

<Hst.Story>
  <Hst.Variant title="A chip">
    <Chip>{value}</Chip>
  </Hst.Variant>

  <Hst.Variant title="A warning chip">
    <Chip intent="warning">{value}</Chip>
  </Hst.Variant>

  <svelte:fragment slot="controls">
    <Hst.Text title="Chip Text:" bind:value />
  </svelte:fragment>
</Hst.Story>
