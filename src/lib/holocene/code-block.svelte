<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import {
    parseWithBigInt,
    stringifyWithBigInt,
  } from '$lib/utilities/parse-with-big-int';
  import type { IconName } from './icon/paths';

  export let content: Parameters<typeof JSON.stringify>[0];
  export let inline = false;
  export let language = 'json';
  export let copyable = true;
  export let title = '';
  export let icon: IconName | undefined = undefined;
  export let unroundTitle = false;
  export let titleColor = 'text-white';

  let root: HTMLElement;
  $: isJSON = language === 'json';

  const formatJSON = (jsonData: string): string => {
    if (!jsonData) return;

    let parsedData: string;
    try {
      parsedData = parseWithBigInt(jsonData);
    } catch (error) {
      parsedData = jsonData;
    }

    return stringifyWithBigInt(parsedData, undefined, inline ? 0 : 2);
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
  {#if title}
    <p
      class="-mb-2 flex items-center gap-2 rounded-t-lg py-2 px-4 text-sm {titleColor}"
      class:unround-title={unroundTitle}
    >
      {#if icon}<Icon name={icon} />{/if}
      {title}
    </p>
  {/if}
  <div
    class="w-full rounded-lg {inline
      ? 'h-auto overflow-auto'
      : 'h-full'} {$$props.class}"
    class:title
    data-testid={$$props.testId}
  >
    <div class="relative h-full">
      <!-- The spacing for this if statement is like this because PRE's honor all whitespace and
      line breaks so we have this peculiar formatting to preserve this components output -->
      <pre
        class="w-full overflow-x-scroll rounded-lg p-4"
        class:h-full={!inline}
        class:title><code
          bind:this={root}
          class="language-{language}"
          data-testid={$$props['data-testid']}
        /></pre>

      {#if copyable}
        <button
          on:click={(e) => copy(e, parsedContent)}
          class="absolute top-0 right-2.5 rounded-md bg-gray-900 opacity-90 hover:bg-white"
        >
          <Icon
            name={$copied ? 'checkmark' : 'copy'}
            class="text-white hover:text-gray-900"
          />
        </button>
      {/if}
    </div>
  </div>
{/if}

<style lang="postcss">
  .inline {
    @apply top-5 right-2;
  }

  .title {
    @apply rounded-t-none;
  }

  .unround-title {
    @apply rounded-t-none;
  }
</style>
