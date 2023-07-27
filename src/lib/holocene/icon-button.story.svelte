<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  import { logEvent } from 'histoire/client';
  import IconButton from './icon-button.svelte';

  export let Hst: HST;
  export let handleClick = (e: MouseEvent) => {
    logEvent('click', e);
  };
</script>

<Hst.Story title="icon-button">
  <IconButton icon="retry" iconTitle="retry" on:click={handleClick} />
</Hst.Story>
