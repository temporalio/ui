<script lang="ts">
  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';

  const href = $derived(
    page.data?.settings?.feedbackURL ||
      'https://github.com/temporalio/ui/issues/new/choose',
  );
</script>

<Button
  size="sm"
  leadingIcon="feedback"
  variant="ghost"
  class="text-brand shadow-md"
  {href}
  target="_blank"
  data-testid="give-feedback"
  rel="noreferrer"
>
  Give Feedback
</Button>
