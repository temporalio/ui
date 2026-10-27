<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import { Accordion, AccordionGroup } from '$lib/io-ark/accordion';

  let note = $state('Investigate retry behavior');
</script>

<AccordionGroup>
  <Accordion title="Overview" subtitle="Execution information" open>
    <p>This workflow processes incoming orders and tracks their fulfillment.</p>
  </Accordion>
  <Accordion
    title="Notes"
    subtitle="Your edits are preserved when you close the panel"
  >
    <Input id="accordion-note" label="Execution note" bind:value={note} />
  </Accordion>
  <Accordion
    title="Retry policy"
    disabled
    subtitle="Unavailable for this execution"
  >
    <p>Retry settings are managed by the workflow definition.</p>
  </Accordion>
</AccordionGroup>
