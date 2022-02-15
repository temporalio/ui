<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  import EditableCodeBlock from '$lib/components/editable-code-block.svelte';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import debounce from 'just-debounce';

  let parameter = 'query';
  let urlQuery = $page.query.get(parameter);

  try {
    urlQuery = JSON.parse(urlQuery);
  } catch (e) {}

  $: value = urlQuery ?? '';

  const update = debounce(updateQueryParameters, 300);

  $: {
    update({
      parameter,
      value,
      query: $page.query,
      path: $page.path,
      goto,
    });
  }
</script>

<EditableCodeBlock bind:value --resize="vertical" />
