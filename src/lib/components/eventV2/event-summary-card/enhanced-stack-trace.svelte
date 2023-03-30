<script>
  import CodeBlock from '$lib/holocene/code-block.svelte';

  const example = `async function wfSubroutine(): Promise<void> {
    await sleep('1 day')
    away myActivity();
  }`;
</script>

<CodeBlock content={example} language="text" />
