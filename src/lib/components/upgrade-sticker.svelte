<script lang="ts">
  import type { PointerEventHandler } from 'svelte/elements';
  import { prefersReducedMotion } from 'svelte/motion';

  import { onDestroy, tick } from 'svelte';

  import { translate } from '$lib/i18n/translate';
  import { IconArrowUpRight, IconClose } from '$lib/io/icon';
  import { dismissedUpgradeNotices } from '$lib/stores/upgrade-notice';
  import {
    computePeel,
    peelProgress,
    type Point,
    toClipPath,
    toMatrix,
  } from '$lib/utilities/sticker-peel';
  import {
    type UpgradeNotice,
    upgradeNoticeKey,
  } from '$lib/utilities/upgrade-notice';

  interface Props {
    notice: UpgradeNotice;
  }

  let { notice }: Props = $props();

  const ROTATION_DEGREES = -2;
  const CURL = { x: 16, y: 14 };
  const HOVER_CURL = { x: 30, y: 24 };
  const PEEL_THRESHOLD = 0.18;
  const CLICK_DISTANCE = 5;

  let sticker = $state<HTMLDivElement>();
  let link = $state<HTMLAnchorElement>();
  let width = $state(0);
  let height = $state(0);
  let pointer = $state<Point | null>(null);
  let hovering = $state(false);
  let peeled = $state(false);
  let revealing = false;
  let drag: { origin: Point; start: Point; moved: number } | null = null;
  let frame = 0;

  const key = $derived(upgradeNoticeKey(notice));
  const dismissed = $derived($dismissedUpgradeNotices.includes(key));
  const current = $derived(`${notice.distribution}@${notice.current}`);
  const latest = $derived(`${notice.distribution}@${notice.latest}`);
  const label = $derived(
    translate('common.upgrade-notice-label', { current, latest }),
  );

  const corner = $derived({ x: width, y: height });
  const rest = $derived.by(() => {
    const curl = hovering ? HOVER_CURL : CURL;
    return { x: width - curl.x, y: height - curl.y };
  });
  const position = $derived(pointer ?? rest);
  const peel = $derived(computePeel(width, height, corner, position));
  const progress = $derived(peelProgress(width, height, corner, position));
  const flapOpacity = $derived(Math.min(1, Math.max(0, (1 - progress) / 0.3)));

  const toLocal = (event: PointerEvent): Point => {
    if (!sticker) return { x: 0, y: 0 };
    const rect = sticker.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    const angle = (-ROTATION_DEGREES * Math.PI) / 180;
    return {
      x: x * Math.cos(angle) - y * Math.sin(angle) + width / 2,
      y: x * Math.sin(angle) + y * Math.cos(angle) + height / 2,
    };
  };

  const animateTo = (target: Point, duration: number, done?: () => void) => {
    cancelAnimationFrame(frame);
    if (prefersReducedMotion.current) {
      pointer = target;
      done?.();
      return;
    }
    const from = position;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      pointer = {
        x: from.x + (target.x - from.x) * eased,
        y: from.y + (target.y - from.y) * eased,
      };
      if (t < 1) {
        frame = requestAnimationFrame(step);
      } else {
        done?.();
      }
    };
    frame = requestAnimationFrame(step);
  };

  const settle = () => animateTo(rest, 280, () => (pointer = null));

  const reveal = () => {
    if (revealing) return;
    revealing = true;
    animateTo({ x: -width - 12, y: -height - 12 }, 700, async () => {
      peeled = true;
      await tick();
      link?.focus();
    });
  };

  const startDrag: PointerEventHandler<HTMLDivElement> = (event) => {
    if (peeled || revealing) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    cancelAnimationFrame(frame);
    drag = { origin: toLocal(event), start: position, moved: 0 };
  };

  const moveDrag: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!drag) return;
    const local = toLocal(event);
    const dx = local.x - drag.origin.x;
    const dy = local.y - drag.origin.y;
    drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
    pointer = {
      x: Math.min(width, drag.start.x + dx),
      y: Math.min(height, drag.start.y + dy),
    };
  };

  const endDrag: PointerEventHandler<HTMLDivElement> = () => {
    if (!drag) return;
    const clicked = drag.moved < CLICK_DISTANCE;
    drag = null;
    if (clicked || progress > PEEL_THRESHOLD) {
      reveal();
    } else {
      settle();
    }
  };

  const cancelDrag = () => {
    if (!drag) return;
    drag = null;
    settle();
  };

  const revealFromKeyboard = (event: MouseEvent) => {
    if (event.detail === 0) reveal();
  };

  const setHovering = (value: boolean) => {
    if (peeled || revealing) return;
    pointer = position;
    hovering = value;
    if (!drag) settle();
  };

  const dismiss = () => {
    $dismissedUpgradeNotices = [...$dismissedUpgradeNotices, key];
  };

  onDestroy(() => cancelAnimationFrame(frame));
</script>

{#if !dismissed}
  <div class="absolute inset-x-0 bottom-0 z-10 group-data-[nav=closed]:hidden">
    <div
      class="sticker"
      class:peeled
      bind:this={sticker}
      bind:clientWidth={width}
      bind:clientHeight={height}
      role="presentation"
      onpointerdown={startDrag}
      onpointermove={moveDrag}
      onpointerup={endDrag}
      onpointercancel={cancelDrag}
      onpointerenter={() => setHovering(true)}
      onpointerleave={() => setHovering(false)}
    >
      <a
        bind:this={link}
        class="reveal font-mono"
        href={notice.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        inert={!peeled}
      >
        <span class="text-[10px] font-bold uppercase tracking-widest">
          {translate('common.upgrade-new-version')}
        </span>
        <span class="reveal-version">{latest}</span>
        <span class="flex items-center gap-1 text-[11px] font-medium">
          {translate('common.upgrade-view-release')}
          <IconArrowUpRight width={12} height={12} />
        </span>
      </a>
      {#if !peeled}
        <button
          type="button"
          class="front"
          style:clip-path={toClipPath(peel.front)}
          aria-label={translate('common.upgrade-reveal-label', { current })}
          onclick={revealFromKeyboard}
        >
          <span class="foil">
            <span class="sheen" aria-hidden="true"></span>
            <span
              class="relative flex h-full flex-col gap-1 px-3 py-2 font-mono"
            >
              <span class="text-[11px]">{current}</span>
              <span class="text-[14px] font-extrabold">
                {translate('common.upgrade-ready')}
              </span>
              <span class="text-[10px] font-bold uppercase tracking-widest">
                {translate('common.upgrade-available')}
              </span>
            </span>
          </span>
        </button>
        <div class="flap-shadow" style:opacity={flapOpacity} aria-hidden="true">
          <div
            class="flap"
            style:clip-path={toClipPath(peel.flap)}
            style:transform={toMatrix(peel.matrix)}
          ></div>
        </div>
      {/if}
    </div>
    <button
      type="button"
      class="absolute -top-2 right-0 z-10 flex size-5 items-center justify-center rounded-full border border-primary bg-surface-primary text-primary shadow hover:bg-surface-secondary"
      aria-label={translate('common.dismiss-upgrade-notice')}
      onclick={dismiss}
    >
      <IconClose width={10} height={10} />
    </button>
  </div>
  <a
    class="badge hidden group-data-[nav=closed]:block"
    href={notice.href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    title={label}
  >
    <span class="foil">
      <span class="sheen" aria-hidden="true"></span>
      <svg
        class="arrow"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.6"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </span>
  </a>
{/if}

<style>
  .sticker {
    position: relative;
    cursor: grab;
    touch-action: none;
    user-select: none;
    height: 5.5rem;
    margin: 0 0.25rem 0.25rem;
    transform: rotate(-2deg);
  }

  .reveal,
  .front,
  .flap-shadow,
  .flap {
    position: absolute;
    inset: 0;
    border-radius: 14px;
  }

  .reveal {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    background:
      radial-gradient(
        120% 140% at 0% 0%,
        rgb(255 201 238 / 22%),
        transparent 55%
      ),
      radial-gradient(
        120% 140% at 100% 100%,
        rgb(191 234 255 / 22%),
        transparent 55%
      ),
      #16112a;
    box-shadow:
      inset 0 0 0 1px rgb(255 255 255 / 12%),
      0 12px 24px rgb(0 0 0 / 35%),
      0 2px 4px rgb(0 0 0 / 30%);
    color: #e9e4f7;
    text-decoration: none;
  }

  .reveal-version {
    background: linear-gradient(
      90deg,
      #ffc9ee,
      #bfeaff 35%,
      #cffbd2 65%,
      #fff1b3
    );
    background-clip: text;
    color: transparent;
    font-size: 16px;
    font-weight: 800;
  }

  .sticker:active {
    cursor: grabbing;
  }

  .sticker.peeled {
    cursor: auto;
  }

  .sticker:not(.peeled) .reveal {
    pointer-events: none;
  }

  .front {
    padding: 4px;
    border: 0;
    background: #f7f4ff;
    color: #1b1433;
    text-align: left;
    cursor: inherit;
  }

  .flap-shadow {
    pointer-events: none;
    filter: drop-shadow(0 6px 6px rgb(0 0 0 / 35%));
  }

  .flap {
    background: linear-gradient(135deg, #fbfaff 0%, #e7e1f2 55%, #cbc2de 100%);
    transform-origin: 0 0;
  }

  .badge {
    position: absolute;
    bottom: 0.25rem;
    left: 50%;
    z-index: 10;
    width: 1.75rem;
    height: 1.75rem;
    margin-left: -0.875rem;
    padding: 2px;
    border-radius: 9999px;
    background: #f7f4ff;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 70%),
      0 6px 14px rgb(0 0 0 / 35%);
    color: #1b1433;
  }

  .foil {
    position: relative;
    display: block;
    height: 100%;
    overflow: hidden;
    border-radius: 10px;
    background: linear-gradient(
      115deg,
      #ffc9ee 0%,
      #bfeaff 17%,
      #cffbd2 33%,
      #fff1b3 49%,
      #ffc4e2 65%,
      #bccfff 81%,
      #e2c2ff 100%
    );
    background-position: 30% 40%;
    background-size: 240% 240%;
  }

  .front .foil::before,
  .front .foil::after {
    position: absolute;
    inset: 0;
    content: '';
  }

  .front .foil::before {
    background-image: repeating-linear-gradient(
      135deg,
      rgb(255 255 255 / 22%) 0,
      rgb(255 255 255 / 22%) 2px,
      transparent 2px,
      transparent 6px
    );
  }

  .front .foil::after {
    background-image: radial-gradient(
      rgb(255 255 255 / 95%) 1px,
      transparent 1.6px
    );
    background-size: 9px 9px;
    opacity: 0.55;
  }

  .badge .foil {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background: linear-gradient(
      115deg,
      #e2c2ff 0%,
      #bccfff 20%,
      #fff1b3 45%,
      #cffbd2 65%,
      #bfeaff 85%,
      #e2c2ff 100%
    );
  }

  .sheen {
    position: absolute;
    inset: 0;
    z-index: 1;
    background-image: linear-gradient(
      105deg,
      transparent 32%,
      rgb(255 255 255 / 80%) 46%,
      transparent 60%
    );
    background-size: 260% 100%;
    animation: holo-sheen 5.5s linear infinite;
  }

  .foil > :not(.sheen) {
    z-index: 2;
  }

  .arrow {
    position: relative;
    z-index: 2;
  }

  @keyframes holo-sheen {
    from {
      background-position: 170% 0;
    }

    to {
      background-position: -70% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sheen {
      animation: none;
    }
  }
</style>
