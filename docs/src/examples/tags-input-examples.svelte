<script lang="ts">
  import { TagsInput } from '$lib/io-poc/tags-input';

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let keywords = $state<string[]>(['priority', 'backorder']);
  let recipients = $state<string[]>(['oncall@example.com']);
  let recipientError = $state('');
</script>

<div class="grid gap-6 rounded-lg border border-primary p-6 sm:grid-cols-2">
  <TagsInput
    label="Order keywords"
    bind:value={keywords}
    placeholder="Add a keyword"
    helperText="Matches workflows whose OrderTags search attribute contains any keyword."
    clearable
  />
  <TagsInput
    label="Alert recipients"
    bind:value={recipients}
    placeholder="name@example.com"
    max={5}
    required
    helperText="Up to 5 addresses. Press Enter or comma to add."
    error={recipientError}
    validate={({ inputValue, value }) =>
      emailPattern.test(inputValue.trim()) &&
      !value.includes(inputValue.trim())}
    onValueInvalid={({ reason }) => {
      recipientError =
        reason === 'rangeOverflow'
          ? 'You can add up to 5 recipients.'
          : 'Enter a new, valid email address.';
    }}
    onValueChange={() => (recipientError = '')}
  />
  <TagsInput
    label="Search attributes"
    value={['CustomerId', 'Region']}
    readOnly
    helperText="Managed in namespace settings."
  />
  <TagsInput label="Excluded build IDs" value={['2026.09.30']} disabled />
</div>
