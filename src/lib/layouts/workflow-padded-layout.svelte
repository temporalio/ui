<script>
  import LabsModeGuard from '$lib/holocene/labs-mode-guard.svelte';
</script>

<LabsModeGuard>
  <div class="surface-secondary h-full px-8 pb-16">
    <slot />
  </div>
  <slot slot="fallback" />
</LabsModeGuard>
