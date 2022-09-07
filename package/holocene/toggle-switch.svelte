<script>export let checked = false;
export let id;
</script>

<label for={id} class="switch">
  <input {id} bind:checked type="checkbox" class="hidden" />
  <span class="slider" />
</label>

<style>
  .switch {
      position: relative;
      display: inline-block;
      height: 2rem;
      width: 52px;
      border-radius: 8rem
}

  .slider {
      position: absolute;
      top: 0px;
      left: 0px;
      right: 0px;
      bottom: 0px;
      cursor: pointer;
      border-radius: 8rem;
      border-width: 2px;
      --tw-border-opacity: 1;
      border-color: rgb(82 82 91 / var(--tw-border-opacity));
      --tw-bg-opacity: 1;
      background-color: rgb(244 244 245 / var(--tw-bg-opacity));
      transition-duration: 300ms
}

  .slider:before {
      position: absolute;
      left: 0.25rem;
      bottom: 0.125rem;
      height: 1.5rem;
      width: 1.5rem;
      border-radius: 50%;
      --tw-bg-opacity: 1;
      background-color: rgb(82 82 91 / var(--tw-bg-opacity));
      transition-duration: 300ms;
      --tw-content: '';
      content: var(--tw-content)
}

  input:checked + .slider {
      --tw-border-opacity: 1;
      border-color: rgb(59 130 246 / var(--tw-border-opacity));
      --tw-bg-opacity: 1;
      background-color: rgb(59 130 246 / var(--tw-bg-opacity))
}

  input:checked + .slider:before {
      --tw-translate-x: 1rem;
      transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
      --tw-bg-opacity: 1;
      background-color: rgb(255 255 255 / var(--tw-bg-opacity));
      text-align: center;
      content: url('data:image/svg+xml, %3Csvg%20width=%2212%22%20height=%2210%22%20viewBox=%220%200%2012%2010%22%20fill=%22none%22%20xmlns=%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%3Cpath%20d=%22M4.36831%209.00391L0.572266%205.20786L1.52128%204.25885L4.36831%207.10588L10.4786%200.995582L11.4276%201.94459L4.36831%209.00391Z%22%20fill=%22%231D4ED8%22%2F%3E%0A%3C%2Fsvg%3E%0A')
}</style>
