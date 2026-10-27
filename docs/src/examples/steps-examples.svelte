<script lang="ts">
  import { Field, FieldInput } from '$lib/io-ark/field';
  import { Steps, type StepsItem } from '$lib/io-ark/steps';

  const items: StepsItem[] = [
    { title: 'Details', description: 'Name and region' },
    { title: 'Retention', description: 'History period' },
    { title: 'Access', description: 'Users and roles' },
    { title: 'Review' },
  ];

  let step = $state(0);
  let name = $state('payments-prod');
  let retention = $state('30');
  let admins = $state('ash@temporal.io');
  let verticalStep = $state(1);
</script>

<div class="flex flex-col gap-10">
  <Steps
    {items}
    bind:step
    linear
    isStepValid={(index) => index !== 0 || name.trim().length > 0}
    nextLabel={step === items.length - 1 ? 'Create namespace' : 'Next'}
  >
    {#snippet content(_item, index)}
      {#if index === 0}
        <Field
          label="Namespace name"
          error={name.trim() ? '' : 'Enter a namespace name.'}
          required
        >
          <FieldInput bind:value={name} />
        </Field>
      {:else if index === 1}
        <Field label="Retention period (days)" helperText="Between 1 and 90.">
          <FieldInput type="number" min="1" max="90" bind:value={retention} />
        </Field>
      {:else if index === 2}
        <Field label="Namespace admins">
          <FieldInput bind:value={admins} />
        </Field>
      {:else}
        <dl class="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1">
          <dt class="text-secondary">Name</dt>
          <dd>{name}</dd>
          <dt class="text-secondary">Retention</dt>
          <dd>{retention} days</dd>
          <dt class="text-secondary">Admins</dt>
          <dd>{admins}</dd>
        </dl>
      {/if}
    {/snippet}
    {#snippet completed()}
      <p>Namespace {name} is being created.</p>
    {/snippet}
  </Steps>

  <Steps
    items={[
      { title: 'Connect worker' },
      { title: 'Run first workflow' },
      { title: 'Invite team' },
    ]}
    bind:step={verticalStep}
    orientation="vertical"
  >
    {#snippet content(item)}
      <p class="text-secondary">Complete “{item.title}” to continue setup.</p>
    {/snippet}
    {#snippet completed()}
      <p>Setup complete.</p>
    {/snippet}
  </Steps>
</div>
