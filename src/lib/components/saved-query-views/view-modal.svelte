<script lang="ts">
  import type { Writable } from 'svelte/store';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    MAX_SAVED_QUERIES,
    type SavedQuery,
  } from '$lib/stores/saved-queries';

  interface Props {
    open?: boolean;
    view?: SavedQuery;
    onSaveView?: (view: SavedQuery) => void;
    onCreateView?: (view: SavedQuery) => void;
    onDeleteView?: (view: SavedQuery) => void;
    id?: string;
    savedQueries: Writable<Record<string, SavedQuery[]>>;
    maxQueries?: number;
  }

  let {
    open = $bindable(false),
    view,
    onSaveView,
    onCreateView,
    onDeleteView,
    id = 'view-modal',
    savedQueries,
    maxQueries = MAX_SAVED_QUERIES,
  }: Props = $props();

  let name = $state('');
  let touched = $state(false);

  const query = $derived(page.url.searchParams.get('query') ?? '');
  const namespace = $derived(page.params.namespace);
  const maxViewsReached = $derived(
    $savedQueries?.[namespace]?.length >= maxQueries,
  );

  let wasOpen = $state(false);

  $effect(() => {
    if (open && !wasOpen) {
      name = view?.name ?? '';
      touched = false;
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
    ($savedQueries?.[namespace] || []).filter((q) => q.type === 'user'),
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
    if (!trimmedName) return translate('common.view-name-required');
    if (!allowedChars.test(trimmedName))
      return translate('common.view-name-invalid-characters');
    if (
      startsWithInvalid.test(trimmedName) ||
      endsWithInvalid.test(trimmedName)
    )
      return translate('common.view-name-invalid-start-end');
    if (collidesWithOther) return translate('common.view-name-not-unique');
    return '';
  });

  const onConfirm = () => {
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

  const onDelete = () => {
    if (view) onDeleteView?.(view);
    hideModal();
  };
</script>

<Modal
  bind:open
  {id}
  confirmText={translate('common.save')}
  cancelText={translate('common.close')}
  confirmDisabled={!nameValid || (!view && maxViewsReached)}
  onCancelModal={hideModal}
  onConfirmModal={onConfirm}
>
  {#snippet titleSnippet()}
    <h3>
      {view
        ? translate('common.edit-view')
        : translate('common.save-as-new-view')}
    </h3>
  {/snippet}
  {#snippet content()}
    <div class="flex h-full flex-1 gap-1">
      <Input
        id="view-name"
        label={translate('common.name')}
        required
        maxLength={255}
        bind:value={name}
        oninput={() => (touched = true)}
        valid={!touched || nameValid}
        hintText={touched && !nameValid ? nameError() : ''}
        error={touched && !nameValid}
        placeholder={translate('common.view-name-placeholder')}
        class="w-full"
        data-testid={`${id}-input`}
      />
    </div>
  {/snippet}
  {#snippet footer()}
    <Button
      variant="destructive"
      class={!onDeleteView ? 'invisible' : ''}
      onclick={onDelete}
    >
      {translate('common.delete-view')}
    </Button>
  {/snippet}
</Modal>
