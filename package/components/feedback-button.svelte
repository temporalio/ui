<script>import Icon from '$holocene/icon/icon.svelte';
import { page } from '$app/stores';
const href = $page.stuff.settings.feedbackURL ||
    'https://github.com/temporalio/ui/issues/new/choose';
</script>

<a {href} target="_blank" data-cy="give-feedback">
  <div class="feedback-button">
    <div class="feedback-icon">
      <Icon class="text-purple-200" name="feedback" height={12} width={12} />
    </div>
    Give Feedback
  </div>
</a>

<style>
  .feedback-button {

    display: flex;

    width: 10rem;

    cursor: pointer;

    align-items: center;

    justify-content: space-between;

    border-radius: 9999px;

    padding-left: 1rem;

    padding-right: 1rem;

    padding-top: 0.5rem;

    padding-bottom: 0.5rem;

    font-size: 0.875rem;

    line-height: 1.25rem;

    --tw-text-opacity: 1;

    color: rgb(233 213 255 / var(--tw-text-opacity));

    --tw-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

    --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);

    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)
}

  .feedback-button:hover {

    --tw-bg-opacity: 1;

    background-color: rgb(63 63 70 / var(--tw-bg-opacity))
}

  .feedback-icon {

    margin-right: 0.5rem;

    border-radius: 9999px;

    border-width: 2px;

    --tw-border-opacity: 1;

    border-color: rgb(233 213 255 / var(--tw-border-opacity))
}</style>
