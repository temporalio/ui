<script>
  import { translate } from '$lib/i18n/translate';
</script>

<h1
  class="relative flex items-center gap-4 text-2xl"
  data-testid="pollers-title"
>
  {translate('common.task-queue')}
</h1>
<slot />
