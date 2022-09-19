<script lang="ts">
  import CodeBlock from './code-block.svelte';

  export let Hst;
</script>

<Hst.Story>
  <CodeBlock
    content={JSON.stringify({ foo: 'bar', baz: false, blue: 42 }, undefined, 2)}
  />
</Hst.Story>
