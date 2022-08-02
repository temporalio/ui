<script lang="ts">
  import Chapter from '../_chapter.svelte';
  import Accordion from '$holocene/accordion.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Table from '$holocene/table/table.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
</script>

<Chapter description="An Accordion with a Table">
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
</Chapter>

<Chapter description="An Accordion with a CodeBlock">
  <Accordion title="Certificates" subtitle="Expires on Wed Feb 01, 2030">
    <CodeBlock content={JSON.stringify({ some: 'thing', blue: 42 })} />
  </Accordion>
</Chapter>
