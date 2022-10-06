<script lang="ts">
  import DatetimePicker from '$lib/holocene/datetime-picker.svelte';

  let currentDate = new Date();

  const onDateChange = (d) => {
    currentDate = d.detail;
  };
</script>

<div class="mb-2 flex justify-center items-center mt-1/2 h-screen">
  <DatetimePicker
    on:datechange={onDateChange}
    selected={currentDate}
    isAllowed={(date) => {
      const millisecs = date.getTime();
      if (millisecs + 25 * 3600 * 1000 < Date.now()) return false;
      if (millisecs > Date.now() + 3600 * 24 * 45 * 1000) return false;
      return true;
    }}
  />
</div>
