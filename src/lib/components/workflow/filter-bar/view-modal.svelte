<script lang="ts">
  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    MAX_SAVED_WORKFLOW_QUERIES,
    type SavedQuery,
    savedWorkflowQueries,
  } from '$lib/stores/saved-queries';

  interface Props {
    open?: boolean;
    view?: SavedQuery;
    onSaveView?: (view: SavedQuery) => void;
    onCreateView?: (view: SavedQuery) => void;
    id?: string;
  }

  let {
    open = $bindable(),
    view,
    onSaveView,
    onCreateView,
    id = 'view-modal',
  }: Props = $props();

  let name = $state('');

  const query = $derived(page.url.searchParams.get('query'));
  const namespace = $derived(page.params.namespace);
  const maxViewsReached = $derived(
    $savedWorkflowQueries?.[namespace]?.length >= MAX_SAVED_WORKFLOW_QUERIES,
  );

  let wasOpen = $state(false);

  $effect(() => {
    if (open && !wasOpen) {
      name = view?.name ?? '';
    }
    wasOpen = open;
  });

  const hideModal = () => {
    open = false;
    name = '';
  };

  const allowedChars = /^[A-Za-z0-9 _.-]+$/;
  const startsWithInvalid = /^[.-]/;
  const endsWithInvalid = /[.-]$/;
  const existing = $derived(
    ($savedWorkflowQueries?.[namespace] || []).filter((q) => q.type === 'user'),
  );

  const trimmedName = $derived(name?.trim() ?? '');
  const hasOnlyAllowed = $derived(
    trimmedName.length > 0 && allowedChars.test(trimmedName),
  );
  const validStartEnd = $derived(
    hasOnlyAllowed &&
      !startsWithInvalid.test(trimmedName) &&
      !endsWithInvalid.test(trimmedName),
  );

  const collidesWithOther = $derived(
    existing.some(
      (q) =>
        q.name.toLowerCase() === trimmedName.toLowerCase() && q.id !== view?.id,
    ),
  );

  const nameValid = $derived(validStartEnd && !collidesWithOther);

  const nameError = $derived(() => {
    if (!trimmedName) return 'Name is required';
    if (!allowedChars.test(trimmedName))
      return 'Use only letters, numbers, spaces, hyphens (-), underscores (_), and periods (.)';
    if (
      startsWithInvalid.test(trimmedName) ||
      endsWithInvalid.test(trimmedName)
    )
      return 'Name cannot start or end with hyphens (-) or periods (.)';
    if (collidesWithOther) return 'A view with this name already exists';
    return '';
  });

  const onConfirm = (event: Event) => {
    event.preventDefault();

    if (!nameValid) return;

    if (view && onSaveView) {
      const updatedView: SavedQuery = {
        ...view,
        name: trimmedName,
        query,
        type: 'user',
      };
      onSaveView(updatedView);
      hideModal();
      return;
    }

    if (onCreateView) {
      const newView: SavedQuery = {
        id: Date.now().toString(),
        name: trimmedName,
        query,
        type: 'user',
      };
      onCreateView(newView);
      hideModal();
    }
  };

  const onCreateAsNew = (event: Event) => {
    event.preventDefault();

    if (!nameValid || !onCreateView) return;

    const base = trimmedName;
    const currentNameTrimmed = view?.name?.trim() ?? '';

    let candidate = base === currentNameTrimmed ? `${base}-copy` : base;
    let i = 2;
    const exists = (n: string) =>
      existing.some((q) => q.name.toLowerCase() === n.toLowerCase());
    while (exists(candidate)) {
      candidate = `${base}-copy-${i++}`;
    }

    const updatedView: SavedQuery = {
      id: Date.now().toString(),
      name: candidate,
      query,
      type: 'user',
    };
    onCreateView(updatedView);
    hideModal();
  };
</script>

<Modal
  bind:open
  {id}
  confirmText={translate('common.save')}
  cancelText={translate('common.close')}
  confirmDisabled={!nameValid || maxViewsReached}
  on:cancelModal={hideModal}
  on:confirmModal={onConfirm}
>
  <h3 slot="title">{view ? 'Edit View' : 'Save as View'}</h3>
  <div class="flex h-full flex-1 flex-col" slot="content">
    <Input
      id="view-name"
      label="Name"
      required
      maxLength={255}
      bind:value={name}
      valid={nameValid}
      hintText={nameValid ? '' : nameError()}
      error={!nameValid}
      placeholder="Name of view"
      class="w-full"
    />
    {#if view}
      <Button
        variant="secondary"
        class="self-start"
        disabled={!nameValid || maxViewsReached}
        on:click={onCreateAsNew}>Create New</Button
      >
    {/if}
  </div>
</Modal>
