<script lang="ts">
  import Chapter from '../_chapter.svelte';
  import Badge from '$lib/holocene/badge.svelte';
</script>

<Chapter description="A Fancy Table">
  <table class="fancy w-full">
    <thead>
      <tr>
        <th class="w-1/5">Status</th>
        <th class="w-1/5">Email</th>
        <th>Role</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <Badge type="active">Active</Badge>
        </td>
        <td>george@temporal.io</td>
        <td>Global Admin</td>
      </tr>
      <tr>
        <td>
          <Badge type="active">Active</Badge>
        </td>
        <td>Lucile@temporal.io</td>
        <td>Developer</td>
      </tr>
      <tr>
        <td>
          <Badge type="active">Active</Badge>
        </td>
        <td>tobias@temporal.io</td>
        <td>Read-Only</td>
      </tr>
    </tbody>
  </table>
</Chapter>

<Chapter description="A Simple Table">
  <table class="simple w-full">
    <thead>
      <tr>
        <th>Attribute</th>
        <th>Type</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>searchAttribute1</td>
        <td>Unspecified</td>
      </tr>
      <tr>
        <td>searchAttribute2</td>
        <td>Text</td>
      </tr>
      <tr>
        <td>searchAttribute3</td>
        <td>Keyword</td>
      </tr>
    </tbody>
  </table>
</Chapter>
