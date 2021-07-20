<table>
  <thead>
    <tr>
      <th>Workflow/Run ID</th>
      <th>Status</th>
      <th>Started</th>
      <th>Ended</th>
    </tr>
  </thead>
  <slot name="rows" />
</table>

<style>
  table {
    border-collapse: collapse;
    width: 100%;
  }

  thead tr {
    background: #f9fafb;
  }

  th {
    background: #f9fafb;
    color: #6b7280;
    font-size: 12px;
    height: 40px;
    letter-spacing: 0.05em;
    line-height: 16px;
    margin: 0;
    padding: 12px 24px;
    text-align: left;
    text-transform: uppercase;
  }
</style>
