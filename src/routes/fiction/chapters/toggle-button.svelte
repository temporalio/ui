<script lang="ts">
  import Chapter from '../_chapter.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';

  let tab = {
    a: 'auto',
    b: 'auto',
  };
</script>

<Chapter description="A toggle button">
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
</Chapter>

<Chapter description="A toggle button with icons">
  <ToggleButtons>
    <ToggleButton
      icon="workflow"
      active={tab.b === 'auto'}
      on:click={() => (tab.b = 'auto')}>Auto</ToggleButton
    >
    <ToggleButton
      icon="calendarPlus"
      active={tab.b === 'manual'}
      on:click={() => (tab.b = 'manual')}>Manual</ToggleButton
    >
  </ToggleButtons>
</Chapter>
