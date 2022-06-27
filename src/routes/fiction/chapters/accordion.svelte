<script lang="ts">
  import Chapter from '../_chapter.svelte';
  import Accordion from '$holocene/accordion.svelte';
  import Table from '$holocene/table/table.svelte';
  import TableRow from '$holocene/table/table-row.svelte';
  import TableCell from '$holocene/table/table-cell.svelte';
  import TableHead from '$lib/holocene/table/table-head.svelte';
  import TableHeader from '$lib/holocene/table/table-header.svelte';
  import TableBody from '$lib/holocene/table/table-body.svelte';
  import CodeBlock from '$lib/components/code-block.svelte';
</script>

<Chapter description="An Accordion with a Table">
  <Accordion
    title="Custom Search Attributes"
    subtitle="19 custom search attributes"
  >
    <Table>
      <TableHead>
        <TableHeader class="w-3/5">Attribute</TableHeader>
        <TableHeader>Type</TableHeader>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell
            >GK0PrRTOwnfjO9AA5gktwvVDxjlVRmaMVXB9SYlXCbLWmLcOeNJ4Kp8AwXmHKYqgT88IfTZ8J1enu8L7UE3kF6qNDYLldyvl9WmUx5cPP3i4WkKyWJuuoLJgOTvWrFmPN5Un42Z2P2YclFxeZZfT4frlHcs8xEDKp8BTOAikgSYwFrE4JqZ2vdJnbR2bD3ebz8ClHhXz8AXOaOhac00cm2ovc9P5n9br24Dsvz5tOlsD1O5n9UsLynrHCuMBbQ3</TableCell
          >
          <TableCell>Text</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>searchAttribute2</TableCell>
          <TableCell>Unspecified</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>searchAttribute3</TableCell>
          <TableCell>Keyword</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>searchAttribute4</TableCell>
          <TableCell>Text</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </Accordion>
</Chapter>

<Chapter description="An Accordion with a CodeBlock">
  <Accordion title="Certificates" subtitle="Expires on Wed Feb 01, 2030">
    <CodeBlock content={JSON.stringify({ some: 'thing', blue: 42 })} />
  </Accordion>
</Chapter>
