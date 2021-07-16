<script>
  export let heading = '';
  export let content = '';
</script>

{#if content}
  <h3>{heading}</h3>
  <code>
    <pre>
      {JSON.stringify(content)}
    </pre>
  </code>
{/if}

<style>
  pre {
    padding: 16px;
    background-color: #f3f4f6;
    overflow-x: scroll;
  }
</style>
