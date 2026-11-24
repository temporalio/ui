<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { z } from 'zod/v3';

  import DrawerContent from '$lib/holocene/drawer-content.svelte';
  import Drawer from '$lib/holocene/drawer.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Button } from '$lib/io/button';

  const schema = z.object({
    taskQueue: z.string().min(3, 'Task queue must be at least 3 characters'),
    workerCount: z.coerce
      .number()
      .int('Use a whole number')
      .min(1, 'Run at least one worker'),
  });

  type Settings = z.infer<typeof schema>;

  // The page owns the saved values; the drawer edits a copy.
  let saved = $state<Settings>({ taskQueue: 'orders', workerCount: 2 });
  let open = $state(false);

  const { form, errors, enhance, reset } = superForm(
    { taskQueue: '', workerCount: 1 },
    {
      SPA: true,
      dataType: 'json',
      validators: zodClient(schema),
      resetForm: false,
      onUpdate: ({ form: validated }) => {
        if (!validated.valid) return;
        saved = validated.data;
        open = false;
      },
    },
  );

  // Seed the form from the saved values each time the drawer opens, so
  // cancelled edits and stale errors don't carry over.
  $effect.pre(() => {
    if (open) reset({ data: $state.snapshot(saved) });
  });

  const close = () => {
    open = false;
  };
</script>

<div class="flex flex-col items-start gap-4">
  <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
    <dt class="text-secondary">Task queue</dt>
    <dd>{saved.taskQueue}</dd>
    <dt class="text-secondary">Workers</dt>
    <dd>{saved.workerCount}</dd>
  </dl>
  <Button colorScheme="secondary" onclick={() => (open = true)}>
    Edit worker settings
  </Button>
</div>

<Drawer
  id="guide-settings-drawer"
  position="right"
  dark={false}
  bind:open
  onClick={close}
  closeButtonLabel="Close worker settings"
  class="w-[32rem] max-w-full sm:max-w-full"
>
  <DrawerContent title="Worker settings">
    <form use:enhance class="flex flex-col gap-4">
      <Input
        id="guide-task-queue"
        label="Task queue"
        bind:value={$form.taskQueue}
        error={!!$errors.taskQueue?.[0]}
        hintText={$errors.taskQueue?.[0]}
      />
      <Input
        id="guide-worker-count"
        label="Workers"
        type="number"
        bind:value={$form.workerCount as unknown as string}
        error={!!$errors.workerCount?.[0]}
        hintText={$errors.workerCount?.[0]}
      />
      <div class="flex justify-end gap-2">
        <Button colorScheme="ghost" onclick={close}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  </DrawerContent>
</Drawer>
