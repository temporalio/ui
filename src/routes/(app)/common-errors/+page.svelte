<script lang="ts">
  import CommonErrorList from '$lib/components/common-errors/common-error-list.svelte';
  import { COMMON_ERRORS } from '$lib/components/common-errors/common-errors-data';
</script>

<div class="flex flex-col gap-6 p-6">
  <h1 class="text-2xl font-medium">Common Errors</h1>
  <CommonErrorList errors={COMMON_ERRORS} />
</div>
