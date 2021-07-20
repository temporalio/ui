<script lang="ts">
  import { formatDate } from '$lib/utilities/format-date';

  export let workflow: WorkflowExecutionAPIResponse;

  let workflowUrl = `/workflows/${workflow.execution.workflowId}/${workflow.execution.runId}`;
</script>

<tr>
  <td>
    <a href={workflowUrl}>
      <h3>
        {workflow.type.name}
      </h3>
      <p>
        {workflow.execution.runId}
      </p>
    </a>
  </td>
  <td>
    <a href={workflowUrl}>
      <p class="workflow-status">{workflow.status}</p>
    </a>
  </td>
  <td>
    <a href={workflowUrl}>
      <p>{formatDate(workflow.startTime)}</p>
    </a>
  </td>
  <td>
    <a href={workflowUrl}>
      <p>{formatDate(workflow.closeTime)}</p>
    </a>
  </td>
</tr>

<style>
  a {
    text-decoration: none;
    display: block;
    padding: 16px 24px;
    height: 100%;
    width: 100%;
  }

  tr {
    background: #f3f4f6;
  }

  tr:hover {
    background: #eeeff1;
  }

  td {
    padding: 0;
  }

  h3 {
    color: #111827;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 20px;
    margin: 0;
  }

  p {
    color: #6b7280;
    font-size: 14px;
    margin: 0;
  }

  p.workflow-status {
    font-family: Inter;
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    text-align: center;
    color: #065f46;
    padding: 2px 10px;
    background: #d1fae5;
    border-radius: 10px;
  }
</style>
