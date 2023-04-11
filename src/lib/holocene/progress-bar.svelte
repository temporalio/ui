<script lang="ts">
  export let width = '100%';
</script>

<div class="meter">
  <span style="width: {width};" />
</div>

<style lang="postcss">
  .meter {
    @apply absolute left-0 right-0 box-content h-[5px] bg-gradient-to-r from-blue-200 to-blue-600;

    box-shadow: inset 0 -1px 1px rgb(255 255 255 / 30%);
    z-index: 5;
  }

  .meter > span {
    @apply relative block h-full overflow-hidden bg-blue-500;

    background-image:
      linear-gradient(
        center bottom,
        rgb(96 165 250) 32%,
        rgb(59 130 246) 77%
      );
    box-shadow:
      inset 0 2px 9px rgb(255 255 255 / 25%),
      inset 0 -2px 6px rgb(0 0 0 / 40%);
  }

  .meter > span::after {
    @apply absolute top-0 left-0 bottom-0 right-0 overflow-hidden;

    content: "";
    background-image:
      linear-gradient(
        -45deg,
        rgb(255 255 255 / 20%) 25%,
        transparent 25%,
        transparent 50%,
        rgb(255 255 255 / 20%) 50%,
        rgb(255 255 255 / 20%) 75%,
        transparent 75%,
        transparent
      );
    z-index: 1;
    background-size: 25px 25px;
    animation: move 1.5s linear infinite;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;
  }

  @keyframes move {
    0% {
      background-position: 0 0;
    }

    100% {
      background-position: 25px 25px;
    }
  }
</style>
