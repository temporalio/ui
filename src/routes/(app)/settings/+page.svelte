<script lang="ts">
  import { onMount } from "svelte";
  import { fetchFlowSettings } from "$lib/services/settings-service";

  onMount(fetchFlowSettings)
</script>

<header class="mb-2 flex justify-between">
  <div>
    <h1 class="text-2xl">Settings</h1>
  </div>
</header>