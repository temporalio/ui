<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from 'svelte-fa';
  import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons';

  export let heading = '';
  export let content: string | Parameters<typeof JSON.stringify>[0];
  export let copied = false;
  export let language = 'json';

  const isJSON = language === 'json';

  const copy = () =>
    navigator.clipboard
      .writeText(formatJSON(JSON.stringify(content)))
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

  onMount(() => {
    window.Prism.highlightAll();
  });
</script>

{#if content || content === null}
  <div class="relative w-full">
    <div id="clipboard" />

    {#if heading}
      <h3 class="text-lg mb-2 w-full">{heading}</h3>
    {/if}

    <pre
      class="p-4">
        <code class="language-{language}">
          {#if isJSON}
            {formatJSON(JSON.stringify(content))}
          {:else}
            {@html content}
          {/if}
        </code>
    </pre>

    <button on:click={copy} class="absolute top-4 right-4 block">
      {#if copied}
        <Icon icon={faCheck} color="white" />
      {:else}
        <Icon icon={faCopy} color="white" />
      {/if}
    </button>
  </div>
{/if}
