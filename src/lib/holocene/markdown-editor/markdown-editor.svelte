<script lang="ts">
  import TabButton from '$lib/holocene/tab-buttons/tab-button.svelte';
  import TabButtons from '$lib/holocene/tab-buttons/tab-buttons.svelte';
  import { useDarkMode } from '$lib/utilities/dark-mode';

  import Editor from './editor.svelte';
  import Preview from './preview.svelte';

  interface Props {
    content: string;
  }

  let { content = $bindable('') }: Props = $props();
  let activeTab: 'edit' | 'preview' = $state('edit');

  const setActiveTab = async (tab: 'edit' | 'preview') => {
    activeTab = tab;
  };
</script>

<div>
  <TabButtons>
    <TabButton
      on:click={() => setActiveTab('edit')}
      active={activeTab === 'edit'}>Edit</TabButton
    >
    <TabButton
      on:click={() => setActiveTab('preview')}
      active={activeTab === 'preview'}>Preview</TabButton
    >
  </TabButtons>

  {#if activeTab === 'edit'}
    <Editor darkMode={$useDarkMode} bind:content />
  {:else}
    <Preview class="border border-subtle" {content} />
  {/if}
</div>
