<div class="meter">
  <span></span>
</div>

<style>
  .meter {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    overflow: hidden;
    background: rgb(var(--color-surface-subtle));
    z-index: var(--z-sticky, 100);
  }

  .meter > span {
    position: absolute;
    inset-block: 0;
    left: 0;
    display: block;
    width: 36%;
    height: 100%;
    background: rgb(var(--color-surface-brand));
    transform: translateX(-110%);
    animation: progress-scan 1.4s var(--ease-standard, ease-in-out) infinite;
    will-change: transform;
  }

  @keyframes progress-scan {
    to {
      transform: translateX(390%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .meter > span {
      animation: none;
      transform: none;
      opacity: 0.75;
      will-change: auto;
    }
  }
</style>
