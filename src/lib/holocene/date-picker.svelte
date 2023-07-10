<script lang="ts">
  // https://svelte.dev/repl/6116680a6c3e49d0908624105018efb7?version=3.12.1

  import { createEventDispatcher } from 'svelte';
  
  import { clickOutside } from '$lib/holocene/outside-click';
  import { getMonthName } from '$lib/utilities/calendar';
  
  import Calender from './calendar.svelte';
  import Icon from './icon/icon.svelte';
  import Input from './input/input.svelte';

  const dispatch = createEventDispatcher();

  export let isAllowed = () => true;
  export let selected = new Date();

  let month: number | undefined;
  let year: number | undefined;
  let showDatePicker = false;

  // so that these change with props
  $: {
    month = selected.getMonth();
    year = selected.getFullYear();
  }

  // handlers
  const onFocus = () => {
    showDatePicker = true;
  };

  const onInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const inputDate = target.value;
    if (inputDate.length === 8) {
      const inputDateSplit = inputDate?.split('/');
      const yearEnd = parseInt(inputDateSplit[2]);
      const year = 2000 + yearEnd;
      const month = parseInt(inputDateSplit[0]) - 1;
      const date = parseInt(inputDateSplit[1]);
      const newDate = new Date(year, month, date);
      dispatch('datechange', newDate);
    }
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

  const onDateChange = (d: CustomEvent) => {
    showDatePicker = false;
    dispatch('datechange', d.detail);
  };
</script>

<div
  class="relative"
  use:clickOutside
  on:click-outside={() => (showDatePicker = false)}
>
  <Input
    id="datepicker"
    icon="calendar-plus"
    type="text"
    on:focus={onFocus}
    on:input={onInput}
    placeholder="MM/DD/YY"
    value={selected.toDateString()}
    clearable
  />
  {#if showDatePicker}
    <div
      class="absolute top-12 z-50 inline-block rounded border border-gray-900 bg-white shadow"
    >
      <div class="mx-3 my-2 flex items-center justify-around">
        <div class="flex items-center justify-center">
          <button on:click={prev}><Icon name="chevron-left" /></button>
        </div>
        <div class="flex items-center justify-center">
          {getMonthName(month)?.label ?? ''}
          {year}
        </div>
        <div class="flex items-center justify-center">
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
      <div class="my-1 flex justify-between px-2">
        <button
          class="cursor-pointer text-[12px]"
          on:click={() => (selected = new Date())}
        >
          Today
        </button>
        <button
          class="cursor-pointer text-[12px]"
          on:click={() => (showDatePicker = false)}
        >
          Close
        </button>
      </div>
    </div>
  {/if}
</div>
