<script lang="ts">
  import type { PointerEventHandler } from 'svelte/elements';

  import { translate } from '$lib/i18n/translate';
  import { IconArrowUp, IconClose, IconStar } from '$lib/io/icon';
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
  const current = $derived(`${notice.distribution}@${notice.current}`);
  const latest = $derived(`${notice.distribution}@${notice.latest}`);
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
  <div class="relative group-data-[nav=closed]:hidden">
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
          <span class="flex items-center justify-between text-[11px]">
            {current}
            <IconStar width={14} height={14} />
          </span>
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
      class="absolute right-0 top-1 flex size-6 items-center justify-center rounded-full border border-primary bg-surface-primary text-primary hover:bg-surface-secondary"
      aria-label={translate('common.dismiss-upgrade-notice')}
      onclick={dismiss}
    >
      <IconClose width={12} height={12} />
    </button>
  </div>
  <a
    class="badge hidden group-data-[nav=closed]:flex"
    href={notice.href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    title={label}
  >
    <span class="foil flex size-full items-center justify-center rounded-full">
      <span class="sheen" aria-hidden="true"></span>
      <IconArrowUp class="relative" width={16} height={16} />
    </span>
  </a>
{/if}

<style>
  .sticker,
  .badge {
    display: block;
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
    margin: 0.75rem 0.5rem 0.25rem;
    border-radius: 14px;
    transition: transform 140ms ease-out;
  }

  .badge {
    width: 2rem;
    height: 2rem;
    margin: 0.5rem auto 0;
    padding: 3px;
    border-radius: 9999px;
    transform: rotate(-6deg);
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
