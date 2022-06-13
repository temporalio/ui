<script lang="ts">
  import Icon from '$lib/holocene/icon/index.svelte';

  import { navOpen } from '$lib/stores/nav-open';

  import NavContainer from '../holocene/nav-container.svelte';
  import NavRow from '../holocene/nav-row.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';

  export let isCloud: boolean;
  export let linkList: Partial<Record<string, string>>;
</script>

<NavContainer {isCloud} {linkList}>
  <svelte:fragment slot="top">
    <NavRow link={linkList.import} {isCloud}>
      <Tooltip right hide={$navOpen} text="Import">
        <div class="nav-icon">
          <Icon {isCloud} name="download" scale={1} />
        </div>
      </Tooltip>
      <div class="nav-title">Import</div>
    </NavRow>
  </svelte:fragment>
</NavContainer>

<style lang="postcss">
  .nav-icon {
    @apply ml-2 mr-2 mt-0 h-6 cursor-pointer;
  }
  .nav-title {
    width: 100px;
    overflow: hidden;
    transition: width 0.25s linear;
    -webkit-transition: width 0.25s linear;
  }
</style>
