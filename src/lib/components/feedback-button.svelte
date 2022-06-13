<script lang="ts">
  import Icon from '$lib/holocene/icon/index.svelte';
  import { page } from '$app/stores';

  const href =
    $page.stuff.settings.feedbackURL ||
    'https://github.com/temporalio/ui/issues/new/choose';
</script>

<a {href} target="_blank" data-cy="give-feedback">
  <div class="feedback-button">
    <div class="feedback-icon">
      <Icon class="" name="feedback" color="#e9d5ff" scale={0.5} />
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
