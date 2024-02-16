<script>
  import LabsModeGuard from '$lib/holocene/labs-mode-guard.svelte';
</script>

<LabsModeGuard>
  <div class="p-8">
    <slot />
  </div>
  <slot slot="fallback" />
</LabsModeGuard>
