<script lang="ts">
  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';
  import WorkflowRunLayoutV2 from '$lib/layouts/workflow-run-layout-v2.svelte';
  import LabsModeGuard from '$lib/holocene/labs-mode-guard.svelte';
</script>

<LabsModeGuard>
  <svelte:fragment slot="labsMode">
    <WorkflowRunLayoutV2>
      <slot />
    </WorkflowRunLayoutV2>
  </svelte:fragment>
  <WorkflowRunLayout>
    <slot />
  </WorkflowRunLayout>
</LabsModeGuard>
