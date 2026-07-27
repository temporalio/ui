<script lang="ts">
  import { type SavedQuery } from '$lib/stores/saved-queries';

  import ViewModal from './view-modal.svelte';

  interface Props {
    open?: boolean;
    view?: SavedQuery;
    onSaveView: (view: SavedQuery) => void;
    onCreateView: (view: SavedQuery) => void;
    onDeleteView: (view: SavedQuery) => void;
  }

  let {
    open = $bindable(),
    view,
    onSaveView,
    onCreateView,
    onDeleteView,
  }: Props = $props();
</script>

<ViewModal
  id="edit-view-modal"
  bind:open
  {view}
  {onSaveView}
  {onCreateView}
  {onDeleteView}
/>
