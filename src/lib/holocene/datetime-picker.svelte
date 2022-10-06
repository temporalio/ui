<script lang="ts">
  // https://svelte.dev/repl/6116680a6c3e49d0908624105018efb7?version=3.12.1

  import { timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';
  import { createEventDispatcher } from 'svelte';
  import Calender from './calendar.svelte';
  import { getMonthName } from './date-time';
  import Icon from './icon/icon.svelte';
  import Input from './input/input.svelte';

  const dispatch = createEventDispatcher();

  // props
  export let isAllowed = () => true;
  export let selected = new Date();

  let value = '';
  // state
  let date, month, year, showDatePicker;

  // so that these change with props
  $: {
    date = selected.getDate();
    month = selected.getMonth();
    year = selected.getFullYear();
  }

  // handlers
  const onFocus = () => {
    showDatePicker = true;
  };

  const next = () => {
    if (month === 11) {
      month = 0;
      year = year + 1;
      return;
    }
    month = month + 1;
  };

  const prev = () => {
    if (month === 0) {
      month = 11;
      year -= 1;
      return;
    }
    month -= 1;
  };

  const onDateChange = (d) => {
    showDatePicker = false;
    dispatch('datechange', d.detail);
  };
</script>

<div class="relative">
  <Input
    id="datepicker"
    icon="calendar-plus"
    type="text"
    on:focus={onFocus}
    placeholder="MM/DD/YY"
    value={selected.toDateString()}
  />
  {#if showDatePicker}
    <div
      class="absolute top-12 z-50 inline-block rounded border border-gray-900 bg-white shadow"
    >
      <div class="mx-3 my-2 flex items-center justify-around">
        <div class="center">
          <button on:click={prev}><Icon name="chevron-left" /></button>
        </div>
        <div class="center">{getMonthName(month)} {year}</div>
        <div class="center">
          <button on:click={next}><Icon name="chevron-right" /></button>
        </div>
      </div>
      <Calender
        {month}
        {year}
        date={selected}
        {isAllowed}
        on:datechange={onDateChange}
      />
    </div>
  {/if}
</div>

<style lang="postcss">
  .center {
    @apply flex items-center justify-center;
  }
</style>
