<script lang="ts">
  import Icon from 'svelte-fa';
  import { faHeart } from '@fortawesome/free-solid-svg-icons';
</script>

<a href="https://github.com/temporalio/ui/issues/new/choose" target="_blank">
  <div class="feedback-button">
    <div class="feedback-icon">
      <Icon class="" icon={faHeart} color="#e9d5ff" scale={0.5} />
    </div>
    Give Feedback
  </div>
</a>

<style lang="postcss">
  .feedback-button {
    @apply rounded-full w-40 px-4 py-2 text-sm text-purple-200 flex items-center justify-between shadow-md cursor-pointer;
  }

  .feedback-button:hover {
    @apply bg-gray-700;
  }

  .feedback-icon {
    @apply rounded-full border-2 border-purple-200 mr-2;
  }
</style>
