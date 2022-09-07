<script>import Icon from '$holocene/icon/icon.svelte';
import { copyToClipboard } from '../utilities/copy-to-clipboard';
export let content;
export let inline = false;
export let language = 'json';
let root;
let isJSON = language === 'json';
const formatJSON = (jsonData) => {
    if (!jsonData)
        return;
    let parsedData;
    try {
        parsedData = JSON.parse(jsonData);
    }
    catch (error) {
        parsedData = jsonData;
    }
    return JSON.stringify(parsedData, undefined, inline ? 0 : 2);
};
$: parsedContent = isJSON ? formatJSON(content) : content;
const { copy, copied } = copyToClipboard();
function highlight(root, language, source) {
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
      class="absolute top-4 right-4"
    >
      <Icon name={$copied ? 'checkmark' : 'copy'} class="text-white" />
    </button>
  </div>
{/if}
