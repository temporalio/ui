<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import NavContainer from '$lib/holocene/navigation/nav-container.svelte';
  import NavRow from '$lib/holocene/navigation/nav-row.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { navOpen } from '$lib/stores/nav-open';

  export let isCloud: boolean;
  export let linkList: Partial<Record<string, string>>;
</script>

<NavContainer {isCloud} {linkList}>
  <svelte:fragment slot="top">
    <NavRow link={linkList.import} {isCloud}>
      <Tooltip right hide={$navOpen} text="Import">
        <div class="nav-icon">
          <Icon {isCloud} name="download" />
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
    transition: width 0.15s linear;
  }
</style>
