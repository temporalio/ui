<script lang="ts">
  export let flyin: boolean;
  export let flyout: boolean;
  export let onClose: () => void;

  import { clickOutside } from '$lib/holocene/outside-click';
  import IconButton from '../icon-button.svelte';
</script>

<div
  class={`
  absolute 
  right-[300px]
  z-10 
  h-full 
  w-[300px] 
  overflow-auto 
  border-r-2 
  border-gray-200 
  bg-white 
  p-5 
  text-gray-900 
  md:right-[500px] 
  md:w-[500px]`}
  class:flyin
  class:flyout
  use:clickOutside
  on:click-outside={onClose}
>
  <div class="relative">
    <div class="absolute right-0 top-0">
      <IconButton aria-expanded={flyin} on:click={onClose} icon="close" />
    </div>
  </div>
  <slot />
</div>

<style lang="postcss">
  :root {
    --animationRight: -500px;

    @media (max-width: 768px) {
      --animationRight: -300px;
    }

    @keyframes flyin {
      0% {
        right: 0;
        box-shadow:
          0 10px 15px -3px rgb(0 0 0 / 10%),
          0 4px 6px -4px rgb(0 0 0 / 10%);
      }

      100% {
        right: var(--animationRight);
        box-shadow: 0 25px 50px -12px rgb(0 0 0 / 25%);
      }
    }

    @keyframes flyout {
      0% {
        right: var(--animationRight);
        box-shadow: 0 25px 50px -12px rgb(0 0 0 / 25%);
      }

      100% {
        right: 0;
        box-shadow:
          0 10px 15px -3px rgb(0 0 0 / 10%),
          0 4px 6px -4px rgb(0 0 0 / 10%);
      }
    }
  }

  .flyin {
    animation-name: flyin;
    animation-duration: 0.3s;
    animation-iteration-count: 1;
    animation-direction: normal;
    animation-timing-function: ease-in-out;
    animation-fill-mode: forwards;
  }

  .flyout {
    animation-name: flyout;
    animation-duration: 0.3s;
    animation-iteration-count: 1;
    animation-direction: normal;
    animation-timing-function: ease-in-out;
    animation-fill-mode: forwards;
  }
</style>
