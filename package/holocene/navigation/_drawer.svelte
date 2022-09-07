<script>export let flyin;
export let flyout;
export let onClose;
import Icon from '$holocene/icon/icon.svelte';
import { clickOutside } from '../outside-click';
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
    <div class="absolute right-0 top-0 cursor-pointer" on:click={onClose}>
      <Icon name="close" />
    </div>
  </div>
  <slot />
</div>

<style>
  :root {
    --animationRight: -500px;
  }

    @media (max-width: 768px) {
  :root {
      --animationRight: -300px
  }
    }

    @-webkit-keyframes flyin {
      0% {
        right: 0;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1),
          0 4px 6px -4px rgb(0 0 0 / 0.1);
      }
      100% {
        right: var(--animationRight);
        box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
      }
    }

    @keyframes flyin {
      0% {
        right: 0;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1),
          0 4px 6px -4px rgb(0 0 0 / 0.1);
      }
      100% {
        right: var(--animationRight);
        box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
      }
    }

    @-webkit-keyframes flyout {
      0% {
        right: var(--animationRight);
        box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
      }
      100% {
        right: 0;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1),
          0 4px 6px -4px rgb(0 0 0 / 0.1);
      }
    }

    @keyframes flyout {
      0% {
        right: var(--animationRight);
        box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
      }
      100% {
        right: 0;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1),
          0 4px 6px -4px rgb(0 0 0 / 0.1);
      }
    }
  .flyin {
    -webkit-animation-name: flyin;
            animation-name: flyin;
    -webkit-animation-duration: 0.3s;
            animation-duration: 0.3s;
    -webkit-animation-iteration-count: 1;
            animation-iteration-count: 1;
    -webkit-animation-direction: normal;
            animation-direction: normal;
    -webkit-animation-timing-function: ease-in-out;
            animation-timing-function: ease-in-out;
    -webkit-animation-fill-mode: forwards;
            animation-fill-mode: forwards;
  }
  .flyout {
    -webkit-animation-name: flyout;
            animation-name: flyout;
    -webkit-animation-duration: 0.3s;
            animation-duration: 0.3s;
    -webkit-animation-iteration-count: 1;
            animation-iteration-count: 1;
    -webkit-animation-direction: normal;
            animation-direction: normal;
    -webkit-animation-timing-function: ease-in-out;
            animation-timing-function: ease-in-out;
    -webkit-animation-fill-mode: forwards;
            animation-fill-mode: forwards;
  }</style>
