<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  
  import Button from './button.svelte';
  import Drawer from './drawer.svelte';

  export let Hst: HST;

  let open = false;

  const handleDrawerClick = () => {
    open = false;
  };

  const handleButtonClick = () => {
    open = true;
  };
</script>

<Hst.Story title="drawer">
  <Button on:click={handleButtonClick}>Open Drawer</Button>
  <Hst.Variant title="From Bottom">
    <Drawer onClick={handleDrawerClick} {open} title="Drawer title" dark>
      <h3 slot="subtitle">Drawer subtitle</h3>
      <p>Some Drawer Content</p>
    </Drawer>
  </Hst.Variant>
  <Hst.Variant title="From Right">
    <Drawer
      onClick={handleDrawerClick}
      {open}
      dark={false}
      title="Drawer Title"
      position="right"
    >
      <svelte:fragment slot="subtitle">Drawer Subtitle</svelte:fragment>
      <p>Some Drawer Content</p>
    </Drawer>
  </Hst.Variant>
</Hst.Story>
