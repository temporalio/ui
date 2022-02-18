<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from 'svelte-fa';
  import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons';

  export let heading = '';
  export let content: string | Parameters<typeof JSON.stringify>[0];
  export let copied = false;
  export let framed = false;
  export let parsed = false;
  export let language = 'json';

  if (framed)
    console.log(
      { content },
      typeof content,
      JSON.parse(content),
      JSON.stringify(content),
    );

  const isJSON = language === 'json';

  const copy = () =>
    navigator.clipboard
      .writeText(isJSON ? formatJSON(JSON.stringify(content)) : content)
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
  <div class="relative w-full" class:framed>
    <div id="clipboard" />

    {#if heading}
      <h3 class="text-lg mb-2 w-full">{heading}</h3>
    {/if}

    <pre
      class="p-4"
      class:rounded-2xl={framed}
      class:h-full={framed}>
        <code class="language-{language}">
          {#if isJSON}
            {formatJSON(content)}
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

<style lang="postcss">
  .framed {
    @apply border-2 border-gray-300 rounded-2xl p-4 flex flex-col;
  }
</style>
