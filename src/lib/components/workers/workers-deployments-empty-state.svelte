<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
</script>

<div class="flex w-full flex-col items-center gap-4 px-5 py-16">
  <div class="flex flex-col items-center gap-2">
    <span class="flex h-20 w-20 items-center justify-center">
      <Icon name="robot" class="block h-full w-full" />
    </span>
    <div class="flex flex-col items-center gap-2 text-center text-primary">
      <p class="text-base font-medium">
        {translate('workers.empty-no-deployments-title')}
      </p>
      <p class="max-w-lg text-sm">
        {translate('workers.empty-no-deployments-description')}
      </p>
    </div>
  </div>
  <Button
    variant="secondary"
    href="https://docs.temporal.io/worker-deployments"
    target="_blank"
    trailingIcon="external-link"
  >
    {translate('workers.view-docs')}
  </Button>
</div>
