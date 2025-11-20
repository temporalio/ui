<script lang="ts">
  import type { LayoutProps } from './$types';

  import { translate } from '$lib/i18n/translate';

  let { children }: LayoutProps = $props();
</script>

<p class="relative flex items-center gap-4" data-testid="task-queue-title">
  {translate('common.task-queue')}
</p>
{@render children()}
