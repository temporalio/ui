<script lang="ts">
  import CommonErrorList from '$lib/components/common-errors/common-error-list.svelte';
  import { COMMON_ERRORS } from '$lib/components/common-errors/common-errors-data';
  import PageTitle from '$lib/components/page-title.svelte';
</script>

<PageTitle title="Common Errors" />
<div class="flex flex-col gap-6">
  <h1>Common Errors</h1>
  <CommonErrorList errors={COMMON_ERRORS} />
</div>
