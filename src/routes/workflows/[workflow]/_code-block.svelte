<script lang="ts">
  export let heading = '';
  export let content = '';
</script>

{#if content}
  <div>
    <h3 class="mt-6 mb-2 font-semibold text-lg">{heading}</h3>
    <code>
      <pre>
        {JSON.stringify(content)}
      </pre>
    </code>
  </div>
{/if}

<style>
  pre {
    padding: 16px;
    background-color: #f3f4f6;
    overflow-x: scroll;
  }
</style>
