<script lang="ts">
  import { page } from '$app/stores';
  import PageTitle from '$lib/components/page-title.svelte';
</script>

<PageTitle title="Import Event History" url={$page.url.href} />
<slot />
