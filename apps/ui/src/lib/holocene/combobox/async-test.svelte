<script lang="ts">
  // The worst case smallest repro for interacting with combobox async

  import Combobox from './combobox.svelte';

  let syncOptions = ['one', 'two', 'three'];
  let asyncOptions = ['asyncone', 'asynctwo', 'asyncthree'];
  let value = '';
  let options = syncOptions;
  let loading = false;
  let abortController: AbortController | null = null;

  $: i = 0;

  export let id = '';

  function input(stuff: CustomEvent) {
    loading = true;
    value = stuff.detail;
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
  on:input={input}
  on:change={(newVal) => {
    console.log('change', newVal);
  }}
  {loading}
  {id}
  noResultsText="No Results"
  label="Async Test"
  placeholder="Type away!"
></Combobox>
