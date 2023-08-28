<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';

  import CodeBlock from '$lib/holocene/code-block.svelte';

  export let Hst: HST;
</script>

<Hst.Story>
  <Hst.Variant title="A json code block">
    <CodeBlock
      content={{ foo: 'bar', baz: false, blue: 42 }}
      copyIconTitle="Click to copy content"
      copySuccessIconTitle="Content copied to clipboard"
    />
  </Hst.Variant>

  <Hst.Variant title="An inline json code block">
    <CodeBlock
      content={[
        '12345678',
        '56781234',
        '12345678',
        '56781234',
        '12345678',
        '56781234',
        '12345678',
        '56781234',
        '12345678',
        '56781234',
      ]}
      inline
      copyIconTitle="Click to copy content"
      copySuccessIconTitle="Content copied to clipboard"
    />
  </Hst.Variant>

  <Hst.Variant title="A text code block">
    <CodeBlock
      content={'temporal operator namespace list'}
      language="text"
      inline
      copyIconTitle="Click to copy content"
      copySuccessIconTitle="Content copied to clipboard"
    />
  </Hst.Variant>
</Hst.Story>
