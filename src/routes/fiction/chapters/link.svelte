<script lang="ts">
  import Link from '$lib/components/link.svelte';
  import Chapter from '../_chapter.svelte';
</script>

<Chapter
  description="A link"
  component={Link}
  props={{ href: 'https://temporal.io' }}>Link</Chapter
>

<Chapter
  description="An active link"
  component={Link}
  props={{ href: 'https://temporal.io', active: true }}>Active Link</Chapter
>
