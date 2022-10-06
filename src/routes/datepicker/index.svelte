<script lang="ts">
  import DatetimePicker from '$lib/holocene/datetime-picker.svelte';

  let currentDate = new Date();

  const onDateChange = (d) => {
    currentDate = d.detail;
  };
</script>

<div class="mb-2 flex justify-center items-center mt-1/2 h-screen">
  <DatetimePicker on:datechange={onDateChange} selected={currentDate} />
</div>
