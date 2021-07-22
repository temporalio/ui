<script lang="ts">
  export let workflowUrl: string;
</script>

<td class="p-0">
  <a href={workflowUrl} class="w-full h-full block no-underline p-6">
    <slot />
  </a>
</td>
