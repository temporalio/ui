<script lang="ts">
  import type { BadgeType } from '$lib/holocene/badge.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { Failure } from '$lib/types';
  import {
    formatAttemptsLeft,
    formatMaximumAttempts,
  } from '$lib/utilities/format-event-attributes';

  import { DetailListLabel, DetailListValue } from '../../detail-list';

  interface Props {
    attempt: number;
    lastFailure: Failure | undefined;
    maximumAttempts: number | undefined;
  }

  let { attempt, lastFailure, maximumAttempts }: Props = $props();

  let failed = $derived(attempt > 1 && !!lastFailure);
  let badgeType: BadgeType = $derived(failed ? 'danger' : 'default');
</script>

<DetailListLabel>Attempt</DetailListLabel>
<DetailListValue>
  <Badge type={badgeType} class="flex items-center gap-2">
    <Icon name="retry" class={failed ? 'text-red-400' : ''} />
    <span>{attempt} of {formatMaximumAttempts(maximumAttempts)}</span>
  </Badge>

  {#if maximumAttempts}
    <p class="ml-1 text-secondary">
      {formatAttemptsLeft(maximumAttempts, attempt)} remaining
    </p>
  {/if}
</DetailListValue>
