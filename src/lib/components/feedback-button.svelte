<script lang="ts">
  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';

  const href =
    $page.data?.settings?.feedbackURL ||
    'https://github.com/temporalio/ui/issues/new/choose';
</script>

<a {href} target="_blank" data-testid="give-feedback" rel="noreferrer">
  <div class="feedback-button">
    <Icon class="mr-2 text-purple-200" name="feedback" height={12} width={12} />
    Give Feedback
  </div>
</a>

<style lang="postcss">
  .feedback-button {
    @apply flex cursor-pointer items-center justify-between px-4 py-2 text-sm text-purple-200 shadow-md;
  }

  .feedback-button:hover {
    @apply bg-slate-700;
  }
</style>
