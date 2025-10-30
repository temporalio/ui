<script lang="ts">
  import { type SavedQuery } from '$lib/stores/saved-queries';

  import ViewModal from './view-modal.svelte';

  interface Props {
    open?: boolean;
    onCreateView: (view: SavedQuery) => void;
  }

  let { open = $bindable(), onCreateView }: Props = $props();
</script>

<ViewModal id="save-view-modal" bind:open {onCreateView} />
