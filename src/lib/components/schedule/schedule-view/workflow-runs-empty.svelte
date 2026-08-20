<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  interface Props {
    class?: string;
    title?: string;
    description?: string;
    openTriggerConfirmationModal: () => void;
    openBackfillConfirmationModal: () => void;
  }

  const {
    class: className,
    openBackfillConfirmationModal,
    openTriggerConfirmationModal,
    title,
    description,
  }: Props = $props();
</script>

<div class={twMerge('flex flex-col items-center gap-4', className)}>
  <Icon name="heartbeat" width={80} height={80} class="text-blue-400" />
  {#if title}
    <p class="text-center text-base font-medium">{title}</p>
  {/if}
  {#if description}
    <p class="text-center text-sm font-medium">
      {description}
    </p>
  {/if}

  <div class="flex flex-col items-center gap-4 sm:flex-row">
    <Button
      size="sm"
      leadingIcon="play"
      onclick={openTriggerConfirmationModal}
      variant="ghost"
      class="border border-io-border-primary"
    >
      {translate('schedules.trigger-now')}
    </Button>
    <Button
      size="sm"
      leadingIcon="retry"
      onclick={openBackfillConfirmationModal}
      variant="ghost"
      class="border border-io-border-primary"
    >
      {translate('schedules.backfill-schedule')}
    </Button>
  </div>
</div>
