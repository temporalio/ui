<script lang="ts">
  // The worst case smallest repro for interacting with combobox async

  import Combobox from './combobox.svelte';

  const syncOptions = ['one', 'two', 'three'];
  const asyncOptions = ['asyncone', 'asynctwo', 'asyncthree'];
  let value = $state('');
  let options = $state(syncOptions);
  let loading = $state(false);
  let abortController: AbortController | null = $state(null);

  let i = $state(0);

  interface Props {
    id?: string;
  }

  let { id = '' }: Props = $props();

  function input(newValue: string) {
    loading = true;
    value = newValue;
    console.log(value);
    options = syncOptions;

    // This makes sure the worst case always happens the newest value comes first
    // with old values coming after, so we know to discard old values.
    i -= 1;

    if (abortController) {
      abortController.abort();
    }

    abortController = new AbortController();
    const { signal } = abortController;

    setTimeout(
      (value) => {
        if (!signal.aborted) {
          console.log('newest options', { value });
          options = asyncOptions;
          loading = false;
        } else {
          // console.log("it's old!", { value });
        }
      },
      2000 + i * 25,
      value,
    );
  }
</script>

<Combobox
  bind:value
  {options}
  {input}
  change={(newVal) => {
    console.log('change', newVal);
  }}
  {loading}
  {id}
  noResultsText="No Results"
  label="Async Test"
  placeholder="Type away!"
></Combobox>
