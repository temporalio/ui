<script lang="ts" module>
  import type { I18nKey } from '$lib/i18n';
  import { type IconComponent, IconLink } from '$lib/io/icon';

  import type { Transition } from './transitions';

  const TRANSITION_ICONS: Readonly<Record<Transition, IconComponent>> = {
    continuedAsNew: IconLink,
    retry: IconLink,
    cron: IconLink,
  };

  const TRANSITION_LABELS: Readonly<Record<Transition, I18nKey>> = {
    continuedAsNew: 'workflows.transition-continued-as-new',
    retry: 'workflows.transition-retry',
    cron: 'workflows.transition-cron',
  };
</script>

<script lang="ts">
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    transition: Transition;
  }

  let { transition }: Props = $props();

  const Icon = $derived(TRANSITION_ICONS[transition]);
</script>

<span class="relative -mr-1.5 w-0 flex-none" aria-hidden="true">
  <span
    class="absolute -left-[3px] top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
    data-testid="run-transition"
    data-transition={transition}
  >
    <Tooltip text={translate(TRANSITION_LABELS[transition])} top usePortal>
      <span
        class="flex size-5 items-center justify-center rounded-full border border-secondary bg-surface-primary text-[11px] text-tertiary shadow-sm"
      >
        <Icon class="rotate-45" />
      </span>
    </Tooltip>
  </span>
</span>
