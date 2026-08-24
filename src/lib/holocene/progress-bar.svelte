<div
  class="absolute left-0 right-0 z-[5] h-1.5 overflow-hidden rounded-full bg-surface-tertiary"
>
  <span class="block h-full w-2/5 rounded-full bg-content-brand"></span>
</div>

<style>
  span {
    animation: move 1.5s linear infinite;
  }

  @keyframes move {
    from {
      transform: translateX(-100%);
    }

    to {
      transform: translateX(350%);
    }
  }
</style>
