<script>
  import { translate } from '$lib/i18n/translate';
</script>

<p class="relative flex items-center gap-4" data-testid="task-queue-title">
  {translate('common.task-queue')}
</p>
<slot />
