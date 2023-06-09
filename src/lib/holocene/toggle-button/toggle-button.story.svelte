<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  import ToggleButton from './toggle-button.svelte';
  import ToggleButtons from './toggle-buttons.svelte';
  let tab = {
    a: 'auto',
    b: 'feed',
  };
  export let Hst: HST;
</script>

<Hst.Story>
  <Hst.Variant title="A Toggle Button">
    <ToggleButtons>
      <ToggleButton
        active={tab.a === 'auto'}
        data-testid="auto"
        on:click={() => (tab.a = 'auto')}>Auto</ToggleButton
      >
      <ToggleButton
        active={tab.a === 'manual'}
        data-testid="manual"
        on:click={() => (tab.a = 'manual')}>Manual</ToggleButton
      >
    </ToggleButtons>
  </Hst.Variant>

  <Hst.Variant title="A Toggle Button with Icons">
    <ToggleButtons>
      <ToggleButton
        icon="feed"
        active={tab.b === 'feed'}
        data-testid="feed"
        on:click={() => (tab.b = 'feed')}>History</ToggleButton
      >
      <ToggleButton
        icon="compact"
        active={tab.b === 'compact'}
        data-testid="compact"
        on:click={() => (tab.b = 'compact')}>Compact</ToggleButton
      >
      <ToggleButton
        icon="json"
        active={tab.b === 'json'}
        data-testid="json"
        on:click={() => (tab.b = 'json')}>JSON</ToggleButton
      >
      <ToggleButton
        icon="download"
        data-testid="download"
        active={tab.b === 'download'}
        on:click={() => (tab.b = 'download')}>Download</ToggleButton
      >
    </ToggleButtons>
  </Hst.Variant>
</Hst.Story>
