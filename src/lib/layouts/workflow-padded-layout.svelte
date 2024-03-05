<script>
  import LabsModeGuard from '$lib/holocene/labs-mode-guard.svelte';
</script>

<LabsModeGuard>
  <div class="h-auto bg-slate-950 p-8 text-white">
    <slot />
  </div>
  <slot slot="fallback" />
</LabsModeGuard>
