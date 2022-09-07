<script>import Icon from '$holocene/icon/icon.svelte';
import NavContainer from './_nav-container.svelte';
import NavRow from './_nav-row.svelte';
import Tooltip from '../tooltip.svelte';
import { navOpen } from '../../stores/nav-open';
export let isCloud;
export let linkList;
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

<style>
  .nav-icon {
    margin-left: 0.5rem;
    margin-right: 0.5rem;
    margin-top: 0px;
    height: 1.5rem;
    cursor: pointer;
}
  .nav-title {
    width: 100px;
    overflow: hidden;
    transition: width 0.25s linear;
    -webkit-transition: width 0.25s linear;
  }</style>
