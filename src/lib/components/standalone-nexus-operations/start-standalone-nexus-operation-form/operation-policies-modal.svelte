<script lang="ts">
  import { writable } from 'svelte/store';

  import Button from '$lib/holocene/button.svelte';
  import DrawerContent from '$lib/holocene/drawer-content.svelte';
  import Drawer from '$lib/holocene/drawer.svelte';
  import DurationInput from '$lib/holocene/duration-input/duration-input.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    open: boolean;
    startToCloseTimeout: string;
    scheduleToCloseTimeout: string;
    scheduleToStartTimeout: string;
    idReusePolicy: string;
    idConflictPolicy: string;
  }

  let {
    open = $bindable(),
    startToCloseTimeout = $bindable(),
    scheduleToCloseTimeout = $bindable(),
    scheduleToStartTimeout = $bindable(),
    idReusePolicy = $bindable(),
    idConflictPolicy = $bindable(),
  }: Props = $props();

  const idReusePolicyStore = writable(idReusePolicy);
  const idConflictPolicyStore = writable(idConflictPolicy);

  $effect(() => {
    const unsub = idReusePolicyStore.subscribe((v) => {
      idReusePolicy = v;
    });
    return unsub;
  });

  $effect(() => {
    const unsub = idConflictPolicyStore.subscribe((v) => {
      idConflictPolicy = v;
    });
    return unsub;
  });
</script>

<Drawer
  {open}
  onClick={() => {
    open = false;
  }}
  position="right"
  id="operation-policies-drawer"
  dark={false}
  closeButtonLabel={translate('common.close')}
  class="w-screen sm:w-[600px]"
>
  <DrawerContent
    title={translate(
      'standalone-nexus-operations.form-operation-policies-heading',
    )}
  >
    <div class="space-y-8">
      <section class="space-y-3">
        <div>
          <h2 class="text-base font-semibold">
            {translate(
              'standalone-nexus-operations.form-id-reuse-policy-heading',
            )}
          </h2>
          <p class="mt-1 text-sm text-secondary">
            {translate(
              'standalone-nexus-operations.form-id-reuse-policy-description',
            )}
          </p>
        </div>
        <RadioGroup name="idReusePolicy" group={idReusePolicyStore}>
          <RadioInput
            id="reuse-allow-duplicate"
            value="NEXUS_OPERATION_ID_REUSE_POLICY_ALLOW_DUPLICATE"
            label={translate(
              'standalone-nexus-operations.form-id-reuse-policy-allow-duplicate-label',
            )}
            description={translate(
              'standalone-nexus-operations.form-id-reuse-policy-allow-duplicate-description',
            )}
          />
          <RadioInput
            id="reuse-allow-duplicate-failed-only"
            value="NEXUS_OPERATION_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY"
            label={translate(
              'standalone-nexus-operations.form-id-reuse-policy-allow-duplicate-failed-only-label',
            )}
            description={translate(
              'standalone-nexus-operations.form-id-reuse-policy-allow-duplicate-failed-only-description',
            )}
          />
          <RadioInput
            id="reuse-reject-duplicate"
            value="NEXUS_OPERATION_ID_REUSE_POLICY_REJECT_DUPLICATE"
            label={translate(
              'standalone-nexus-operations.form-id-reuse-policy-reject-duplicate-label',
            )}
            description={translate(
              'standalone-nexus-operations.form-id-reuse-policy-reject-duplicate-description',
            )}
          />
        </RadioGroup>
      </section>

      <section class="space-y-3">
        <div>
          <h2 class="text-base font-semibold">
            {translate(
              'standalone-nexus-operations.form-id-conflict-policy-heading',
            )}
          </h2>
          <p class="mt-1 text-sm text-secondary">
            {translate(
              'standalone-nexus-operations.form-id-conflict-policy-description',
            )}
          </p>
        </div>
        <RadioGroup name="idConflictPolicy" group={idConflictPolicyStore}>
          <RadioInput
            id="conflict-fail"
            value="NEXUS_OPERATION_ID_CONFLICT_POLICY_FAIL"
            label={translate(
              'standalone-nexus-operations.form-id-conflict-policy-fail-label',
            )}
            description={translate(
              'standalone-nexus-operations.form-id-conflict-policy-fail-description',
            )}
          />
          <RadioInput
            id="conflict-use-existing"
            value="NEXUS_OPERATION_ID_CONFLICT_POLICY_USE_EXISTING"
            label={translate(
              'standalone-nexus-operations.form-id-conflict-policy-use-existing-label',
            )}
            description={translate(
              'standalone-nexus-operations.form-id-conflict-policy-use-existing-description',
            )}
          />
        </RadioGroup>
      </section>

      <section class="space-y-3">
        <div>
          <h2 class="text-base font-semibold">
            {translate('standalone-nexus-operations.form-timeouts-heading')}
          </h2>
          <p class="mt-1 text-sm text-secondary">
            {translate('standalone-nexus-operations.form-timeouts-description')}
          </p>
        </div>
        <div class="space-y-4">
          <div>
            <DurationInput
              id="drawer-scheduleToCloseTimeout"
              label={translate(
                'standalone-nexus-operations.form-schedule-to-close-timeout-label',
              )}
              bind:value={scheduleToCloseTimeout}
            />
            <p class="mt-1 text-xs text-secondary">
              {translate(
                'standalone-nexus-operations.form-schedule-to-close-timeout-hint',
              )}
            </p>
          </div>
          <div>
            <DurationInput
              id="drawer-scheduleToStartTimeout"
              label={translate(
                'standalone-nexus-operations.form-schedule-to-start-timeout-label',
              )}
              bind:value={scheduleToStartTimeout}
            />
            <p class="mt-1 text-xs text-secondary">
              {translate(
                'standalone-nexus-operations.form-schedule-to-start-timeout-hint',
              )}
            </p>
          </div>
          <div>
            <DurationInput
              id="drawer-startToCloseTimeout"
              label={translate(
                'standalone-nexus-operations.form-start-to-close-timeout-label',
              )}
              bind:value={startToCloseTimeout}
            />
            <p class="mt-1 text-xs text-secondary">
              {translate(
                'standalone-nexus-operations.form-start-to-close-timeout-hint',
              )}
            </p>
          </div>
        </div>
      </section>

      <div class="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="ghost"
          on:click={() => {
            open = false;
          }}>{translate('common.cancel')}</Button
        >
        <Button
          type="button"
          variant="primary"
          on:click={() => {
            open = false;
          }}
          >{translate(
            'standalone-nexus-operations.form-update-policies-button',
          )}</Button
        >
      </div>
    </div>
  </DrawerContent>
</Drawer>
