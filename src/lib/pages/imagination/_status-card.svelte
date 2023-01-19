<script lang="ts">
  import Card from '$lib/holocene/card.svelte';
  import { fetchStatusWorkflowCount } from '$lib/services/workflow-service';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';

  export let namespace: string;
  export let status: WorkflowStatus;
  export let onClick: (status: WorkflowStatus, count: number) => void;
</script>

{#await fetchStatusWorkflowCount(namespace, status)}
  <button>
    <Card class="w-auto text-center {$$props.class}">
      <h3>{status}</h3>
      <Skeleton class="w-8 h-4" />
    </Card>
  </button>
{:then count}
  <button on:click={() => onClick(status, count)}>
    <Card class="w-auto text-center {$$props.class}">
      <h3>{status}</h3>
      <strong>{count}</strong>
    </Card>
  </button>
{/await}
