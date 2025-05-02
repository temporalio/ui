<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import { clickoutside } from '$lib/holocene/outside-click';
  import { translate } from '$lib/i18n/translate';
  import { getMonthName } from '$lib/utilities/calendar';

  import Calender from './calendar.svelte';
  import Icon from './icon/icon.svelte';
  import Input from './input/input.svelte';

  const dispatch = createEventDispatcher();

  export let isAllowed: (d: Date) => boolean = () => true;
  export let selected = new Date();
  export let label: string;
  export let labelHidden = false;
  export let todayLabel: string;
  export let closeLabel: string;
  export let clearLabel: string;
  export let disabled = false;

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
    } else if (inputDate.length === 0) {
      dispatch('dateclear', {});
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

  const previousMonth = translate('date-picker.previous-month');
  const nextMonth = translate('date-picker.next-month');
</script>

<div class="relative" use:clickoutside={() => (showDatePicker = false)}>
  <Input
    id="datepicker"
    {label}
    {labelHidden}
    icon="calendar-plus"
    type="text"
    on:focus={onFocus}
    on:input={onInput}
    placeholder="MM/DD/YY"
    value={selected.toDateString()}
    clearable
    clearButtonLabel={clearLabel}
    {disabled}
  />
  {#if showDatePicker}
    <div
      class="surface-primary absolute z-30 inline-block rounded border border-subtle shadow"
    >
      <div class="mx-3 my-2 flex items-center justify-around">
        <div class="flex items-center justify-center">
          <button type="button" on:click={prev} title={previousMonth}>
            <span class="sr-only">{previousMonth}</span>
            <Icon name="chevron-left" /></button
          >
        </div>
        <div class="flex items-center justify-center">
          {getMonthName(month)?.label ?? ''}
          {year}
        </div>
        <div class="flex items-center justify-center">
          <span class="sr-only">Next Month</span>
          <button type="button" on:click={next} title={nextMonth}>
            <span class="sr-only">{nextMonth}</span>
            <Icon name="chevron-right" />
          </button>
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
          type="button"
          class="cursor-pointer text-[12px]"
          on:click={() => (selected = new Date())}
        >
          {todayLabel}
        </button>
        <button
          type="button"
          class="cursor-pointer text-[12px]"
          on:click={() => (showDatePicker = false)}
        >
          {closeLabel}
        </button>
      </div>
    </div>
  {/if}
</div>
