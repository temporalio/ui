<script lang="ts">
  import type { Hst } from '@histoire/plugin-svelte';
  import Card from './card.svelte';

  export let Hst: Hst;
</script>

<Hst.Story>
  <Card>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
  </Card>
</Hst.Story>
