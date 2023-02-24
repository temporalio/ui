<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  import ToggleButton from './toggle-button.svelte';
  import ToggleButtons from './toggle-buttons.svelte';
  let tab = {
    a: 'auto',
    b: 'auto',
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
        icon="workflow"
        active={tab.b === 'auto'}
        on:click={() => (tab.b = 'auto')}>Auto</ToggleButton
      >
      <ToggleButton
        icon="calendar-plus"
        active={tab.b === 'manual'}
        on:click={() => (tab.b = 'manual')}>Manual</ToggleButton
      >
    </ToggleButtons>
  </Hst.Variant>
</Hst.Story>
