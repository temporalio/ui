<script lang="ts">
  import Chapter from '../_chapter.svelte';
  import Accordion from '$holocene/accordion.svelte';
  import CodeBlock from '$lib/components/code-block.svelte';
</script>

<Chapter description="An Accordion with a Table">
  <Accordion
    title="Custom Search Attributes"
    subtitle="19 custom search attributes"
  >
    <table class="simple w-full">
      <thead>
        <tr>
          <th>Attribute</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>searchAttribute1</td>
          <td>Unspecified</td>
        </tr>
        <tr>
          <td>searchAttribute2</td>
          <td>Text</td>
        </tr>
        <tr>
          <td>searchAttribute3</td>
          <td>Keyword</td>
        </tr>
      </tbody>
    </table>
  </Accordion>
</Chapter>

<Chapter description="An Accordion with a CodeBlock">
  <Accordion title="Certificates" subtitle="Expires on Wed Feb 01, 2030">
    <CodeBlock content={JSON.stringify({ some: 'thing', blue: 42 })} />
  </Accordion>
</Chapter>
