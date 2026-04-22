<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Drawer from '$lib/holocene/drawer.svelte';
  import { translate } from '$lib/i18n/translate';

  import ServerlessWorkerSetupGuide from './serverless-worker-setup-guide.svelte';

  interface Props {
    cfnTemplate?: string;
  }

  let { cfnTemplate }: Props = $props();
  let open = $state(false);
</script>

<Button
  variant="secondary"
  class="xl:hidden"
  trailingIcon="chevron-right"
  on:click={() => (open = true)}
>
  {translate('workers.setup-guide-title')}
</Button>

<Drawer
  class="surface-information"
  closeButtonLabel={translate('common.close')}
  onClick={() => (open = false)}
  position="right"
  dark={false}
  bind:open
>
  <div class="p-6 pt-4">
    <ServerlessWorkerSetupGuide {cfnTemplate} />
  </div>
</Drawer>
