<script lang="ts">
  import type { Snippet } from 'svelte';

  import { translate } from '$lib/i18n/translate';
  interface Props {
    children: Snippet;
  }
  let { children }: Props = $props();
</script>

<p class="relative flex items-center gap-4" data-testid="task-queue-title">
  {translate('common.task-queue')}
</p>
{@render children()}
