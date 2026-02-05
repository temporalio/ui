<script lang="ts">
  import ViewModal from '$lib/components/workflow/filter-bar/view-modal.svelte';
  import { type SavedQuery } from '$lib/stores/saved-queries';

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
  id="activity-edit-view-modal"
  bind:open
  {view}
  {onSaveView}
  {onCreateView}
  {onDeleteView}
/>
