<script lang="ts">
  import Chapter from '../_chapter.svelte';
  import Button from '$lib/holocene/button.svelte';
</script>

<Chapter description="A primary button" component={Button}>Click Me</Chapter>

<Chapter
  description="A dangerous button"
  component={Button}
  props={{ destroy: true }}>Danger</Chapter
>

<Chapter
  description="A button as an anchor"
  component={Button}
  props={{ href: 'https://temporal.io', as: 'anchor' }}>Link</Chapter
>

<Chapter
  description="A button with an Icon"
  component={Button}
  props={{ icon: 'refresh' }}
>
  Reload
</Chapter>
