<script lang="ts">
  import { setIoTranslate, type IoTranslate } from '@temporalio/io/i18n';
  import { BadgeStatus } from '@temporalio/io/badge-status';

  let { translate }: { translate?: IoTranslate } = $props();

  if (translate) setIoTranslate(translate);
</script>

<BadgeStatus status="Running" data-testid="badge" />
