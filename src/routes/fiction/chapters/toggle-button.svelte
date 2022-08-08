<script lang="ts">
  import Chapter from '../_chapter.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';

  let tab = 'auto';
</script>

<Chapter description="A toggle button with icons">
  <ToggleButtons>
    <ToggleButton
      icon="workflow"
      active={tab === 'auto'}
      on:click={() => (tab = 'auto')}>Auto</ToggleButton
    >
    <ToggleButton
      icon="calendarPlus"
      active={tab === 'manual'}
      on:click={() => (tab = 'manual')}>Manual</ToggleButton
    >
  </ToggleButtons>
</Chapter>
