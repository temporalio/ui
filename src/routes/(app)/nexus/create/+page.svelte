<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Textarea from '$lib/holocene/textarea.svelte';
  import { translate } from '$lib/i18n/translate';
  import { routeForNexus } from '$lib/utilities/route-for';

  let name = '';
  let description = '';
  let handler = '';
  let taskQueue = '';
</script>

<PageTitle title={translate('nexus.nexus')} url={$page.url.href} />

<div class="flex w-full flex-col gap-8">
  <div class="text-sm">
    <Link href={routeForNexus()} icon="chevron-left">
      {translate('nexus.back-to-services')}
    </Link>
  </div>
  <h1 data-testid="namespace-selector-title" class="text-4xl">
    {translate('nexus.create-service')}
  </h1>
  <div class="flex w-full flex-col gap-4 xl:w-1/2">
    <Input
      bind:value={name}
      label={translate('nexus.service-name')}
      id="service-name"
      maxLength={255}
      placeholder={translate('nexus.service-name')}
    />
    <Textarea
      bind:value={description}
      label={translate('common.description')}
      id="description"
      placeholder={translate('common.description')}
    />
    <Input
      required
      bind:value={handler}
      label={translate('nexus.namespace-handler')}
      id="service-handler"
      placeholder={translate('nexus.handler')}
    />
    <Input
      required
      bind:value={taskQueue}
      label={translate('common.task-queue')}
      id="task-queue"
      placeholder={translate('common.task-queue')}
    />
    <div class="flex items-center gap-4">
      <Button disabled={!name} variant="primary"
        >{translate('nexus.create-service')}</Button
      >
      <Button variant="ghost">{translate('common.cancel')}</Button>
    </div>
  </div>
</div>
