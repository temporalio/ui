<script lang="ts">
  import JSONbig from 'json-bigint';
  import Icon from '$holocene/icon/icon.svelte';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';

  export let content: Parameters<typeof JSON.stringify>[0];
  export let inline = false;
  export let language = 'json';

  let root: HTMLElement;
  let isJSON = language === 'json';

  const formatJSON = (jsonData: string): string => {
    if (!jsonData) return;

    let parsedData: string;
    try {
      parsedData = JSONbig.parse(jsonData, {
        useNativeBigInt: true, // toggles whether to use native BigInt instead of bignumber.js
      });
    } catch (error) {
      parsedData = jsonData;
    }

    return JSONbig.stringify(parsedData, undefined, inline ? 0 : 2);
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
</script>

{#if parsedContent || parsedContent === null}
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
        class="language-{language}"
        data-cy={$$props['data-cy']}
      /></pre>

    <button
      on:click={(e) => copy(e, parsedContent)}
      class="absolute top-4 right-4 rounded-full opacity-90 hover:bg-white"
      class:inline
    >
      <Icon
        name={$copied ? 'checkmark' : 'copy'}
        class="text-white hover:text-gray-900"
      />
    </button>
  </div>
{/if}

<style lang="postcss">
  .inline {
    @apply top-5 right-2;
  }
</style>
