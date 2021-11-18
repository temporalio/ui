<script lang="ts">
  import SkeletonLoader from '$lib/components/skeleton-loader/skeleton-loader.svelte';

  export let count = 1;
</script>

<tr>
  <td colspan="5">
    <SkeletonLoader {count} />
  </td>
</tr>
