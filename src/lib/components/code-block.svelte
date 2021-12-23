<script lang="ts">
  import { onMount } from 'svelte';

  export let heading = '';
  export let content: string | Parameters<typeof JSON.stringify>[0];
  export let copied = false;
  export let inline = false;

  const copy = () =>
    navigator.clipboard
      .writeText(content)
      .then(() => {
        copied = !copied;
        setTimeout(() => (copied = false), 2000);
      })
      .catch((error) => console.error(error));

  const formatJSON = (jsonData: string) => {
    const parsedData = JSON.parse(jsonData);
    const formated = JSON.stringify(parsedData, undefined, 2);
    return formated;
  };

  onMount(() => window.Prism.highlightAll());
</script>

{#if inline}
  <code class="language-json" style="white-space: nowrap;">
    {formatJSON(JSON.stringify(content))}
  </code>
{:else if content || content === null}
  <div class="relative w-full">
    <div id="clipboard" />

    {#if heading}
      <h3 class="text-lg mb-2 w-full">{heading}</h3>
    {/if}

    <pre
      class="p-4">
        <code class="language-json">
          {formatJSON(JSON.stringify(content))}
        </code>
      </pre>

    <button on:click={copy}>
      {#if copied}
        <i class="fas fa-check" />
      {:else}
        <i class="fas fa-clipboard" />
      {/if}
    </button>
  </div>
{/if}
