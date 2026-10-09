<script lang="ts">
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconLock } from '$lib/io/icon';
</script>

<EmptyState
  title={translate('common.permission-denied-title')}
  content={translate('common.permission-denied-description')}
  Icon={IconLock}
  testId="permission-denied"
/>
