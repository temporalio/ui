<script lang="ts">
  import ViewModal from '$lib/components/workflow/filter-bar/view-modal.svelte';
  import { type SavedQuery } from '$lib/stores/saved-queries';

  interface Props {
    open?: boolean;
    onCreateView: (view: SavedQuery) => void;
  }

  let { open = $bindable(), onCreateView }: Props = $props();
</script>

<ViewModal id="activity-save-view-modal" bind:open {onCreateView} />
