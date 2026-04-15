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

<Button variant="ghost" class="xl:hidden" on:click={() => (open = true)}>
  {translate('workers.setup-guide-title')}
</Button>

<Drawer
  closeButtonLabel={translate('common.close')}
  onClick={() => (open = false)}
  position="right"
  dark={false}
  bind:open
>
  <div class="surface-secondary p-6 pt-4">
    <ServerlessWorkerSetupGuide {cfnTemplate} />
  </div>
</Drawer>
