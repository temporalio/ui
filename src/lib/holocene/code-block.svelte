<script lang="ts">
  import Icon from '$lib/holocene/icon/index.svelte';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';

  export let content: Parameters<typeof JSON.stringify>[0];
  export let inline = false;
  export let language = 'json';
  export let highlightLine = Number.MAX_SAFE_INTEGER;
  export let lineOffset = 1;
  export let type = '';
  export let stackHead = false;
  let displayLineNumbers =
    highlightLine == Number.MAX_SAFE_INTEGER ? '' : 'line-numbers';

  let root: HTMLElement;
  let isJSON = language === 'json';

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

  $: parsedContent = isJSON ? formatJSON(content) : content;
  const { copy, copied } = copyToClipboard();

  function highlight(root: HTMLElement, language: string, source: string) {
    root.textContent = source;
    root.classList.forEach((item) => root.classList.remove(item));
    if (language) {
      root.classList.add(`language-${language}`);
    }

    window.Prism.highlightElement(root);
  }

  $: {
    if (root && window.Prism) {
      highlight(root, language, parsedContent);
    }
  }

  function showStack(element: HTMLElement) {
    element.classList.toggle('activated');
    let content = element.nextElementSibling as HTMLElement;
    while (!content.classList.contains('snippet')) {
      content = content.nextElementSibling as HTMLElement;
    }
    if (content.style.display === 'block') {
      content.style.display = 'none';
    } else {
      content.style.display = 'block';
    }
  }
</script>

{#if parsedContent || parsedContent === null}
  <style>
    .collapsible {
      padding-left: 36px;
    }
    .snippet {
      padding-left: 72px;
      display: none;
    }
  </style>
  <div
    class="relative h-auto w-full rounded-lg {$$props.class} {inline
      ? ''
      : 'lg:h-full'} {type}"
    data-cy={$$props.dataCy}
    style={stackHead ? 'padding-left:0' : ''}
  >
    <!-- The spacing for this if statement is like this because PRE's honor all whitespace and 
      line breaks so we have this peculiar formatting to preserve this components output -->
    <pre
      class="w-full overflow-x-scroll rounded-lg p-4 {displayLineNumbers}"
      data-start={lineOffset}
      data-line={lineOffset + 5}
      class:h-full={!inline}><code
        bind:this={root}
        class="language-{language}"
        data-cy={$$props['data-cy']}
      /></pre>
    {#if type === 'collapsible'}
      <button
        on:click={(e) => showStack(e.currentTarget.parentElement)}
        class="absolute top-4 right-24"
      >
        <Icon name={'arrowUp'} stroke="white" />
      </button>
      <button
        on:click={(e) => showStack(e.currentTarget.parentElement)}
        class="absolute top-4 right-14"
      >
        <Icon name={'arrowDown'} stroke="white" />
      </button>
    {/if}
    {#if type}
      <button
        on:click={(e) => copy(e, parsedContent)}
        class="absolute top-4 right-4"
      >
        <Icon name={$copied ? 'checkMark' : 'copy'} stroke="white" />
      </button>
    {/if}
  </div>
{/if}
