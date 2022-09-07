<script>import Icon from '$holocene/icon/icon.svelte';
import Logo from '../logo.svelte';
import { navOpen } from '../../stores/nav-open';
export let isCloud = false;
export let linkList;
function toggleNav() {
    $navOpen = !$navOpen;
}
</script>

<nav class="nav-header transition-width " data-cy="navigation-header">
  <div
    class="nav-wrapper transition-width"
    class:cloud={isCloud}
    class:open={$navOpen}
    class:close={!$navOpen}
  >
    <div>
      <a
        href={linkList.home}
        class="absolute block"
        style="top: 22px; left: 18px;"
      >
        <Logo height="24px" width="24px" {isCloud} />
      </a>
    </div>
    <button
      class="nav-toggle transition-left"
      style="top: 52px;"
      on:click={toggleNav}
    >
      <Icon name={$navOpen ? 'nav-collapse' : 'nav-expand'} />
    </button>
    <div class="mt-24 grow items-center">
      <ul class="flex flex-col gap-2">
        <slot name="top" />
      </ul>
    </div>
    <div class="grow-0 items-center">
      <ul class="flex flex-col gap-2 pb-32">
        <slot name="bottom" />
      </ul>
    </div>
  </div>
  <slot name="drawer" />
</nav>

<style>
  .nav-header {
    position: relative;
    z-index: 0;
    display: flex;
    height: 100vh;
    border-right-width: 2px;
    --tw-border-opacity: 1;
    border-color: rgb(228 228 231 / var(--tw-border-opacity));
}

  .nav-wrapper {
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    --tw-bg-opacity: 1;
    background-color: rgb(24 24 27 / var(--tw-bg-opacity));
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    padding-top: 0.75rem;
    --tw-text-opacity: 1;
    color: rgb(255 255 255 / var(--tw-text-opacity));
}

  .cloud {
    --tw-bg-opacity: 1;
    background-color: rgb(255 255 255 / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: rgb(24 24 27 / var(--tw-text-opacity));
}

  .close :global(.nav-title) {
    width: 0px;
  }
  .open :global(.nav-title) {
    width: 100px;
  }
  .open :global(.namespace) {
    width: 100px;
  }

  .nav-toggle {
    visibility: hidden;
    position: absolute;
}

  .nav-header:hover .nav-toggle {
    visibility: visible;
}

  .nav-header:focus .nav-toggle {
    visibility: visible;
}

  .close .nav-toggle {
    left: 18px;
  }
  .open .nav-toggle {
    left: 132px;
  }

  .transition-left {
    transition: left 0.25s linear, width 0.25s linear;
    -webkit-transition: left 0.25s linear, width 0.25s linear;
  }

  .transition-width {
    transition: width 0.25s ease-in-out, width 0.25s ease-in-out;
    -webkit-transition: width 0.25s ease-in-out, width 0.25s ease-in-out;
  }</style>
