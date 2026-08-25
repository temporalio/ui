<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconHeartbeat, IconPlaySolid, IconRetry } from '$lib/io/icon';
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
  <IconHeartbeat width={80} height={80} class="text-blue-400" />
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
      LeadingIcon={IconPlaySolid}
      onclick={openTriggerConfirmationModal}
      variant="ghost"
      class="border border-subtle"
    >
      {translate('schedules.trigger-now')}
    </Button>
    <Button
      size="sm"
      LeadingIcon={IconRetry}
      onclick={openBackfillConfirmationModal}
      variant="ghost"
      class="border border-subtle"
    >
      {translate('schedules.backfill-schedule')}
    </Button>
  </div>
</div>
