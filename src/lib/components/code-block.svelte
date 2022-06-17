<script lang="ts">
  import Icon from '$lib/holocene/icon/index.svelte';

  export let content: Parameters<typeof JSON.stringify>[0];
  export let copied = false;
  export let inline = false;
  export let language = 'json';

  $: isJSON = language === 'json';

  const copy = () =>
    navigator.clipboard
      .writeText(isJSON ? formatJSON(content) : content)
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

  let root: HTMLElement;

  function highlight(root: HTMLElement, language: string, source: string) {
    root.textContent = isJSON ? formatJSON(source) : source;
    root.classList.forEach((item) => root.classList.remove(item));
    if (language) {
      root.classList.add(`language-${language}`);
    }

    window.Prism.highlightElement(root);
  }

  $: {
    if (root && window.Prism) {
      highlight(root, language, content);
    }
  }
</script>

{#if content || content === null}
  <div
    class="relative h-auto w-full rounded-lg {$$props.class} {inline
      ? ''
      : 'lg:h-full'}"
    data-cy={$$props.dataCy}
  >
    <!-- The spacing for this if statement is like this because PRE's honor all whitespace and 
      line breaks so we have this peculiar formatting to preserve this components output -->
    <pre
      class="w-full overflow-x-scroll rounded-lg p-4"
      class:h-full={!inline}><code
        bind:this={root}
        class={`language-${language}`}
        data-cy={$$props['data-cy']}
      /></pre>

    <button on:click={copy} class="absolute top-4 right-4">
      <Icon name={copied ? 'checkMark' : 'copy'} stroke="white" />
    </button>
  </div>
{/if}
