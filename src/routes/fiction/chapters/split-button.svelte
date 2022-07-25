<script lang="ts">
  import SplitButton from '$holocene/split-button.svelte';
  import MenuItem from '$holocene/primitives/menu/menu-item.svelte';
  import Chapter from '../_chapter.svelte';
</script>

<Chapter description="A Split Button">
  <SplitButton id="button-1" label="Edit">
    <MenuItem destructive>Delete Namespace</MenuItem>
  </SplitButton>
</Chapter>

<Chapter description="A disabled Split Button">
  <SplitButton id="button-2" label="Edit" disabled />
</Chapter>

<Chapter description="A right-aligned Split Button">
  <div class="flex flex-row justify-end">
    <SplitButton id="button-3" label="Edit" right href="/">
      <MenuItem destructive>Delete</MenuItem>
      <MenuItem>Edit</MenuItem>
    </SplitButton>
  </div>
</Chapter>
