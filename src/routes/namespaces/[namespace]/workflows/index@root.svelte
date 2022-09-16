<script lang="ts">
  import { onDestroy, getContext } from 'svelte';
  import Workflows from '$lib/pages/workflows.svelte';

  const CurrentUser = getContext('CurrentUser');

  console.log('$CurrentUser', CurrentUser);
</script>

<h1>Cats</h1>
<Workflows />
