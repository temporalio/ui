<script lang="ts">
  import Link from './link.svelte';

  export let Hst;

  let active = false;
</script>

<Hst.Story>
  <Link {active} href="https://temporal.io">Click Me!</Link>

  <svelte:fragment slot="controls">
    <Hst.Checkbox title="Active: " bind:value={active} />
  </svelte:fragment>
</Hst.Story>
