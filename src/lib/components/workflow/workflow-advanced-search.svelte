<script lang="ts">
  import { fade } from 'svelte/transition';
  import { fly } from 'svelte/transition';

  import { page } from '$app/stores';

  import WorkflowTypeaheadSearch from '$lib/components/workflow/workflow-typeahead-search.svelte';
  import { translate } from '$lib/i18n/translate';
</script>

<div class="w-full" in:fade>
  <WorkflowTypeaheadSearch in:fly={{ x: -100, duration: 150 }} />
</div>
