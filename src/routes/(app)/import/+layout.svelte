<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';

  interface Props {
    children: Snippet;
  }
  let { children }: Props = $props();
</script>

<PageTitle title="Import Event History" url={page.url.href} />
{@render children()}
