<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { page } from '$app/stores';

  const href =
    $page.data?.settings?.feedbackURL ||
    'https://github.com/temporalio/ui/issues/new/choose';
</script>

<a {href} target="_blank" data-testid="give-feedback" rel="noreferrer">
  <div class="feedback-button">
    <div class="feedback-icon">
      <Icon class="text-purple-200" name="feedback" height={12} width={12} />
    </div>
    Give Feedback
  </div>
</a>

<style lang="postcss">
  .feedback-button {
    @apply flex w-40 cursor-pointer items-center justify-between rounded-full px-4 py-2 text-sm text-purple-200 shadow-md;
  }

  .feedback-button:hover {
    @apply bg-gray-700;
  }

  .feedback-icon {
    @apply mr-2 rounded-full border-2 border-purple-200;
  }
</style>
