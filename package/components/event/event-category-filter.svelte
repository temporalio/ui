<script>var _a, _b, _c;
import { page } from '$app/stores';
import Icon from '$holocene/icon/icon.svelte';
import DropdownMenu from '../dropdown-menu.svelte';
import { allEventTypeOptions, compactEventTypeOptions, } from '../../models/event-history/get-event-categorization';
import { updateQueryParameters } from '../../utilities/update-query-parameters';
export let compact = false;
let parameter = 'category';
let options = compact ? compactEventTypeOptions : allEventTypeOptions;
$: _value = (_c = (_b = (_a = $page.url) === null || _a === void 0 ? void 0 : _a.searchParams) === null || _b === void 0 ? void 0 : _b.get(parameter)) !== null && _c !== void 0 ? _c : undefined;
$: {
    updateQueryParameters({
        parameter: parameter,
        value: _value,
        url: $page.url,
    }).then((v) => (_value = v === null || v === void 0 ? void 0 : v.toString()));
}
const onOptionClick = (option) => {
    _value = option;
};
</script>

<DropdownMenu value={_value} left>
  {#each options as { label, option } (option)}
    <div
      class="option"
      class:active={_value === option}
      on:click={() => onOptionClick(option)}
    >
      <div class="check active">
        {#if _value === option}
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
    width: 1rem
}
  .active {
    --tw-text-opacity: 1;
    color: rgb(29 78 216 / var(--tw-text-opacity))
}</style>
