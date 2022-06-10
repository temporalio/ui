<script lang="ts">
  import Workflows from '$lib/pages/workflows.svelte';
  import { workflows, loading, updating } from '$lib/stores/workflows';
</script>

<Workflows workflows={$workflows} loading={$loading} updating={$updating} />
