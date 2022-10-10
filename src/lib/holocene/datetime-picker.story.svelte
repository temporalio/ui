<script lang="ts">
  import DatetimePicker from '$lib/holocene/datetime-picker.svelte';

  let currentDate = new Date();

  const onDateChange = (d) => {
    currentDate = d.detail;
  };

  export let Hst;
</script>

<Hst.Story>
  <DatetimePicker on:datechange={onDateChange} selected={currentDate} />
</Hst.Story>
