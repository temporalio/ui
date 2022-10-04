<script lang="ts">
  import type { Hst } from '@histoire/plugin-svelte';
  import CodeBlock from './code-block.svelte';

  export let Hst: Hst;
</script>

<Hst.Story>
  <CodeBlock
    content={JSON.stringify({ foo: 'bar', baz: false, blue: 42 }, undefined, 2)}
  />
</Hst.Story>
