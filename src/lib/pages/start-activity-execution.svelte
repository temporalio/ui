<script lang="ts">
  import StandaloneActivityForm from '$lib/components/activity-execution-form/form.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    namespace: string;
  }

  let { namespace }: Props = $props();
</script>

<h1>{translate('activities.start-standalone-activity')}</h1>

<StandaloneActivityForm {namespace} />
