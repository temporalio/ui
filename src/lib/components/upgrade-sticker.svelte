<script lang="ts">
  import type { PointerEventHandler } from 'svelte/elements';

  import { translate } from '$lib/i18n/translate';
  import { IconClose } from '$lib/io/icon';
  import { dismissedUpgradeNotices } from '$lib/stores/upgrade-notice';
  import {
    type UpgradeNotice,
    upgradeNoticeKey,
  } from '$lib/utilities/upgrade-notice';

  interface Props {
    notice: UpgradeNotice;
  }

  let { notice }: Props = $props();

  const REST = { rx: 0, ry: 0, x: 30, y: 40 };
  let pointer = $state(REST);

  const key = $derived(upgradeNoticeKey(notice));
  const dismissed = $derived($dismissedUpgradeNotices.includes(key));
  const current = $derived(`${notice.component}@${notice.current}`);
  const latest = $derived(`${notice.component}@${notice.latest}`);
  const label = $derived(
    translate('common.upgrade-notice-label', {
      current,
      latest,
    }),
  );

  const transform = $derived(
    `perspective(520px) rotateX(${pointer.rx}deg) rotateY(${pointer.ry}deg) rotate(-2deg)`,
  );

  const tilt: PointerEventHandler<HTMLAnchorElement> = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    pointer = {
      rx: (0.5 - y) * 18,
      ry: (x - 0.5) * 22,
      x: x * 100,
      y: y * 100,
    };
  };

  const dismiss = () => {
    $dismissedUpgradeNotices = [...$dismissedUpgradeNotices, key];
  };
</script>

{#if !dismissed}
  <div class="absolute inset-x-0 bottom-0 z-10 group-data-[nav=closed]:hidden">
    <a
      class="sticker"
      href={notice.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onpointermove={tilt}
      onpointerleave={() => (pointer = REST)}
      style:transform
      style:--holo-x="{pointer.x}%"
      style:--holo-y="{pointer.y}%"
    >
      <span class="foil">
        <span class="sheen" aria-hidden="true"></span>
        <span class="relative flex flex-col gap-2 px-3 py-2 font-mono">
          <span class="text-[11px]">{current}</span>
          <span class="flex flex-col">
            <span class="text-[10px] font-bold uppercase tracking-widest">
              {translate('common.upgrade-to')}
            </span>
            <span class="text-[15px] font-extrabold">{latest}</span>
          </span>
        </span>
      </span>
    </a>
    <button
      type="button"
      class="absolute -top-2 right-0 flex size-5 items-center justify-center rounded-full border border-primary bg-surface-primary text-primary shadow hover:bg-surface-secondary"
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
  .sticker,
  .badge {
    padding: 4px;
    background: #f7f4ff;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 70%),
      0 12px 24px rgb(0 0 0 / 35%),
      0 2px 4px rgb(0 0 0 / 30%);
    color: #1b1433;
    text-decoration: none;
  }

  .sticker {
    display: block;
    margin: 0 0.25rem 0.25rem;
    border-radius: 14px;
    transition: transform 140ms ease-out;
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
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 70%),
      0 6px 14px rgb(0 0 0 / 35%);
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

  .badge .foil::before,
  .badge .foil::after {
    display: none;
  }

  .arrow {
    position: relative;
    z-index: 2;
  }

  .foil {
    position: relative;
    display: block;
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
    background-position: var(--holo-x, 30%) var(--holo-y, 40%);
    background-size: 240% 240%;
  }

  .foil::before,
  .foil::after {
    position: absolute;
    inset: 0;
    content: '';
  }

  .foil::before {
    background-image: repeating-linear-gradient(
      135deg,
      rgb(255 255 255 / 22%) 0,
      rgb(255 255 255 / 22%) 2px,
      transparent 2px,
      transparent 6px
    );
  }

  .foil::after {
    background-image: radial-gradient(
      rgb(255 255 255 / 95%) 1px,
      transparent 1.6px
    );
    background-size: 9px 9px;
    opacity: 0.55;
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

  @keyframes holo-sheen {
    from {
      background-position: 170% 0;
    }

    to {
      background-position: -70% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sticker {
      transition: none;
    }

    .sheen {
      animation: none;
    }
  }
</style>
