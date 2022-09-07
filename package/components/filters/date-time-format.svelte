<script>import Icon from '$holocene/icon/icon.svelte';
import DropdownMenu from '../dropdown-menu.svelte';
import { timeFormat, setTimeFormat, } from '../../stores/time-format';
let dateOptions = [
    { label: 'UTC Time', option: 'UTC' },
    { label: 'Relative Time', option: 'relative' },
    { label: 'Local Time', option: 'local' },
];
const onDateOptionClick = (option) => {
    setTimeFormat(option);
};
$: value = $timeFormat === 'UTC' ? undefined : `${$timeFormat}`;
</script>

<DropdownMenu {value} right dataCy="date-time-format-filter">
  {#each dateOptions as { label, option } (option)}
    <div
      class="option"
      class:active={$timeFormat === option}
      on:click={() => onDateOptionClick(option)}
      data-cy="event-date-filter-{option}"
    >
      <div class="check">
        {#if $timeFormat === option}
          <Icon name="checkmark" />
        {/if}
      </div>
      <div class="label">
        {label}
      </div>
    </div>
  {/each}
</DropdownMenu>

<style>
  .option {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    display: flex;
    font-weight: 400
}
  .label {
    cursor: pointer
}
  .check {
    margin-left: 1rem;
    margin-right: 1rem;
    margin-top: 0.25rem;
    width: 1rem
}
  .active {
    --tw-text-opacity: 1;
    color: rgb(29 78 216 / var(--tw-text-opacity))
}</style>
