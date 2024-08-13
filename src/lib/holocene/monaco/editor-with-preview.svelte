<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { capitalize } from '$lib/utilities/format-camel-case';

  import ToggleButton from '../toggle-button/toggle-button.svelte';
  import ToggleButtons from '../toggle-button/toggle-buttons.svelte';

  import Editor from './editor.svelte';
  import Markdown from './markdown.svelte';

  let showPreview = false;

  export let key: string;
  export let content = '';
</script>

<ToggleButtons>
  <ToggleButton
    active={showPreview === false}
    data-testid="{key}-editor"
    on:click={() => (showPreview = false)}>{capitalize(key)}</ToggleButton
  >
  <ToggleButton
    active={showPreview === true}
    data-testid="{key}-preview"
    on:click={() => (showPreview = true)}
    >{translate('common.preview')}</ToggleButton
  >
</ToggleButtons>
{#if showPreview}
  <Markdown {content} />
{:else}
  <Editor {content} on:change={(event) => (content = event.detail.value)} />
{/if}
