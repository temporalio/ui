<script lang="ts">
  export let heading = '';
  export let content = '';
</script>

{#if content}
  <div>
    <h3 class="mt-6 mb-2 font-semibold text-lg overflow-x-scroll">{heading}</h3>
    <code>
      <pre class="p-6 bg-gray-200">
        {JSON.stringify(content)}
      </pre>
    </code>
  </div>
{/if}
