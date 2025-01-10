<script lang="ts">
  import { writable, type Writable } from 'svelte/store';

  import { v4 as uuid } from 'uuid';

  import { page } from '$app/stores';

  import { type PayloadInputEncoding } from '$lib/components/payload-input-with-encoding.svelte';
  import PayloadInput from '$lib/components/payload-input.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { translate } from '$lib/i18n/translate';
  import { updateWorkflow } from '$lib/services/workflow-service';
  import { workflowRun } from '$lib/stores/workflow-run';

  $: ({ namespace, workflow: workflowId, run: runId } = $page.params);
  $: ({ metadata } = $workflowRun);
  $: updateDefinitions = metadata?.definition?.updateDefinitions;

  const defaultEncoding: PayloadInputEncoding = 'json/plain';

  // let error = '';
  // let loading = false;

  let name = '';
  let updateId = uuid();
  let input = '';
  let customUpdate = false;
  let encoding: Writable<PayloadInputEncoding> = writable(defaultEncoding);

  $: requirements = [
    {
      text: 'The first character must be a letter (a-z)',
      invalid: name && !/^[a-z]/i.test(name),
    },
    {
      text: 'All letters must be lowercase',
      invalid: name && name !== name.toLowerCase(),
    },
  ];

  const update = async () => {
    // error = '';
    // loading = true;
    try {
      await updateWorkflow({
        namespace,
        workflow: { workflowId, runId },
        input,
        updateId,
        encoding: $encoding,
        name,
      });
    } catch (err) {
      // error = isNetworkError(err)
      //   ? err.message
      //   : translate('common.unknown-error');
    } finally {
      // loading = false;
    }
  };

  const handleCustom = () => {
    customUpdate = true;
    name = '';
  };
</script>

<section>
  <Card class="mt-7 flex h-fit w-full w-full flex-col gap-4 xl:w-1/2">
    <h3>Send Update</h3>
    {#if updateDefinitions?.length > 0 && !customUpdate}
      <Select
        id="update-select"
        label={translate('common.name')}
        class="min-w-fit"
        bind:value={name}
        data-testid="update-select"
        placeholder="Select an Update"
        required
      >
        {#each updateDefinitions as { name: value, description = '' }}
          <Option {value} {description}>{value}</Option>
        {/each}
        <Option on:click={handleCustom} value="custom">Custom</Option>
      </Select>
    {:else}
      <div class="flex w-full items-end justify-between gap-2">
        <Input
          id="update-name"
          class="w-full"
          label={translate('common.name')}
          required
          bind:value={name}
        />
        {#if customUpdate}
          <Button
            on:click={() => {
              customUpdate = false;
              name = '';
            }}
            variant="secondary"
            leadingIcon="close"
          />
        {/if}
      </div>
    {/if}
    <ul class="surface-background p-4">
      {#each requirements as { text, invalid }}
        <li class="flex gap-1" class:text-danger={invalid}>
          <Icon
            width={16}
            height={16}
            name={invalid ? 'xmark-filled' : 'circle-check-filled'}
            class={`mt-0.5 shrink-0 ${
              invalid ? 'text-danger' : 'text-success'
            }`}
          />
          {text}
        </li>
      {/each}
    </ul>
    <Input
      id="update-id"
      label={translate('workflows.update-id')}
      required
      bind:value={updateId}
    />

    <PayloadInput bind:input />
    <Button
      on:click={update}
      disabled={!name || !encoding}
      variant="primary"
      class="w-full">Send Update</Button
    >
  </Card>
</section>
