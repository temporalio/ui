<script lang="ts">
  import EventStatusBadge, {
    type EventStatus,
  } from '$lib/components/event/event-status-badge.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconClock, IconClose } from '$lib/io/icon';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { formatEventGroupDuration } from '$lib/utilities/event-group-duration';

  type Props = {
    group: EventGroup;
    endTime?: string | Date | number;
    /** False once the event's run has ended, so it shows no pending state. */
    active?: boolean;
    onClose: () => void;
    /**
     * The side panel leads with the event's name rather than its status, and
     * closes from an icon alone.
     */
    variant?: 'inline' | 'panel';
    class?: string;
  };

  const {
    group,
    endTime = Date.now(),
    active = true,
    onClose,
    variant = 'inline',
    class: className = '',
  }: Props = $props();

  const duration = $derived(
    formatEventGroupDuration({ group, endTime, includeMilliseconds: true }),
  );

  const status = $derived.by<EventStatus>(() => {
    const pending = active ? group.pendingActivity : undefined;
    if (pending) {
      if (pending.paused) return 'Paused';
      if ((pending.attempt ?? 0) > 1) return 'Retrying';
      return 'Pending';
    }
    return group.finalClassification || group.classification;
  });
</script>

<div
  class="flex items-center justify-between gap-2 bg-surface-secondary text-sm {className}"
>
  <!-- In the panel the title lines up with the content below it. -->
  <div
    class="flex min-w-0 items-center gap-4 {variant === 'panel'
      ? 'pl-4 pr-2'
      : 'px-2'}"
  >
    {#if variant === 'inline'}
      <EventStatusBadge {status} />
    {/if}
    <span
      class="truncate"
      class:text-base={variant === 'panel'}
      class:font-medium={variant === 'panel'}>{group.displayName}</span
    >
    {#if variant === 'panel'}
      <EventStatusBadge {status} />
    {/if}
    {#if duration}
      <div class="flex shrink-0 items-center gap-1">
        <IconClock />
        {duration}
      </div>
    {/if}
  </div>
  <div
    class="flex shrink-0 items-center gap-4"
    class:pr-1={variant === 'panel'}
  >
    {#if variant === 'panel'}
      <Button
        variant="ghost"
        size="xs"
        LeadingIcon={IconClose}
        aria-label={translate('common.close')}
        title={translate('common.close')}
        onclick={onClose}
      />
    {:else}
      <Button variant="ghost" size="xs" onclick={onClose}
        >{translate('common.close')} <IconClose /></Button
      >
    {/if}
  </div>
</div>
