<script lang="ts">
  import ToggleButton from './toggle-button.svelte';
  import ToggleButtons from './toggle-buttons.svelte';
  let tab = {
    a: 'auto',
    b: 'auto',
  };
  export let Hst;
</script>

<Hst.Story>
  <Hst.Variant title="A Toggle Button">
    <ToggleButtons>
      <ToggleButton
        active={tab.a === 'auto'}
        data-cy="auto"
        on:click={() => (tab.a = 'auto')}>Auto</ToggleButton
      >
      <ToggleButton
        active={tab.a === 'manual'}
        data-cy="manual"
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
