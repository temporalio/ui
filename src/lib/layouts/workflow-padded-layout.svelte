<script>
  import LabsModeGuard from '$lib/holocene/labs-mode-guard.svelte';
</script>

<LabsModeGuard>
  <div class="surface-secondary h-full p-8">
    <slot />
  </div>
  <slot slot="fallback" />
</LabsModeGuard>
