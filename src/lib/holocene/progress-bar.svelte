<div class="meter">
  <span></span>
</div>

<style>
  .meter {
    position: absolute;
    left: 0;
    right: 0;
    height: 3px;
    background: #334155;
    box-sizing: content-box;
    box-shadow:
      inset 0 -1px 1px rgb(255 255 255 / 30%),
      0 1px 2px rgb(0 0 0 / 20%);
    z-index: 5;
  }

  .meter > span {
    position: relative;
    display: block;
    height: 100%;
    background: linear-gradient(to right, #64748b 0%, #475569 100%);
    box-shadow:
      inset 0 2px 5px rgb(255 255 255 / 30%),
      inset 0 -2px 3px rgb(0 0 0 / 40%),
      0 0 3px rgb(100 116 139 / 50%);
  }

  .meter > span::after {
    position: absolute;
    inset: 0;
    overflow: hidden;
    content: '';
    background-image: linear-gradient(
      -45deg,
      rgb(255 255 255 / 25%) 25%,
      transparent 25%,
      transparent 50%,
      rgb(255 255 255 / 25%) 50%,
      rgb(255 255 255 / 25%) 75%,
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
