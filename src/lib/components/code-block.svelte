<script lang="ts">
  import { onMount } from 'svelte';

  import Icon from 'svelte-fa';
  import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons';

  export let content: Parameters<typeof JSON.stringify>[0];
  export let copied = false;
  export let inline = false;
  export let language = 'json';

  const isJSON = language === 'json';

  const copy = () =>
    navigator.clipboard
      .writeText(isJSON ? formatJSON(JSON.stringify(content)) : content)
      .then(() => {
        copied = !copied;
        setTimeout(() => (copied = false), 2000);
      })
      .catch((error) => console.error(error));

  const formatJSON = (jsonData: string): string => {
    if (!jsonData) return;

    let parsedData: string;
    try {
      parsedData = JSON.parse(jsonData);
    } catch (error) {
      parsedData = jsonData;
    }

    return JSON.stringify(parsedData, undefined, inline ? 0 : 2);
  };

  onMount(() => {
    window.Prism.highlightAll();
  });

  console.log($$props);
</script>

{#if content || content === null}
  <div
    class="relative w-full rounded-lg h-auto {$$props.class} {inline
      ? ''
      : 'lg:h-full'}"
    data-cy={$$props.dataCy}
  >
    <!-- The spacing for this if statement is like this because PRE's honor all whitespace and 
      line breaks so we have this peculiar formatting to preserve this components output -->
    <pre
      class="p-4 rounded-lg w-full overflow-x-scroll"
      class:h-full={!inline}><code class="language-{language}" data-cy={$$props['data-cy']}
      >{#if isJSON}{formatJSON(content)}{:else}{@html content}{/if}</code></pre>

    <button on:click={copy} class="absolute top-4 right-4">
      <Icon icon={copied ? faCheck : faCopy} color="white" />
    </button>
  </div>
{/if}
