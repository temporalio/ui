<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  
  import CodeBlock from '$lib/holocene/code-block.svelte';
  
  import Accordion from './accordion.svelte';
  import IconButton from './icon-button.svelte';
  import TableHeaderRow from './table/table-header-row.svelte';
  import TableRow from './table/table-row.svelte';
  import Table from './table/table.svelte';

  export let Hst: HST;
</script>

<Hst.Story layout={{ type: 'single', iframe: false }}>
  <Hst.Variant title="With a Simple Table">
    <Accordion
      title="Custom Search Attributes"
      subtitle="19 custom search attributes"
    >
      <Table variant="simple" class="w-full">
        <TableHeaderRow slot="headers">
          <th>Attribute</th>
          <th>Type</th>
        </TableHeaderRow>
        <TableRow>
          <td>searchAttribute1</td>
          <td>Unspecified</td>
        </TableRow>
        <TableRow>
          <td>searchAttribute2</td>
          <td>Text</td>
        </TableRow>
        <TableRow>
          <td>searchAttribute3</td>
          <td>Keyword</td>
        </TableRow>
      </Table>
    </Accordion>
  </Hst.Variant>

  <Hst.Variant title="With a Code Block">
    <Accordion title="Certificates" subtitle="Expires on Wed Feb 01, 2030">
      <CodeBlock content={{ some: 'thing', blue: 42 }} />
    </Accordion>
  </Hst.Variant>

  <Hst.Variant title="A disabled Accordion">
    <Accordion
      disabled
      title="Certificates"
      subtitle="Expires on Wed Feb 01, 2030"
    >
      <p>Accordion content here.</p>
    </Accordion>
  </Hst.Variant>

  <Hst.Variant title="A read-only Accordion">
    <Accordion
      readOnly
      open
      title="Certificates"
      subtitle="Expires on Wed Feb 01, 2030"
    >
      <p>Accordion content here.</p>
    </Accordion>
  </Hst.Variant>

  <Hst.Variant title="An Accordion with an error">
    <Accordion
      title="Certificates"
      subtitle="Expired on Wed Feb 01, 2030"
      error="Expired"
    >
      <p>Accordion content here.</p>
    </Accordion>
  </Hst.Variant>

  <Hst.Variant title="An Accordion with an action">
    <Accordion title="Certificates" subtitle="Expires on Wed Feb 01, 2030">
      <IconButton class="!p-0" icon="info" slot="action" />
      <p>Accordion content here.</p>
    </Accordion>
  </Hst.Variant>

  <Hst.Variant title="An Accordion in a form that doesn't submit the form">
    <form
      on:submit={() => {
        throw new Error("The form submitted and that's bad");
      }}
    >
      <Accordion title="Certificates" subtitle="Expires on Wed Feb 01, 2030">
        <IconButton class="!p-0" icon="info" slot="action" />
        <p>Accordion content here.</p>
      </Accordion>
    </form>
  </Hst.Variant>
</Hst.Story>
