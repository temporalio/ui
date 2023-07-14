<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  
  import Card from './card.svelte';

  export let Hst: HST;
</script>

<Hst.Story>
  <Card>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
  </Card>
</Hst.Story>
