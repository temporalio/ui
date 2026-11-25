## Usage

```ts
import { Badge } from '$lib/io/badge';
```

Badges are small, non-interactive labels used to communicate status, categorize content, or draw attention to metadata. They appear alongside other UI elements and are purely informational — they do not trigger actions.

| Do                                                                                                                                                                                         | Don't                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep labels short. One or two words is ideal. Badges are not sentences — "Active", "Pending review", "12" are appropriate; "Waiting for approval" is not.                                  | Don't make badges interactive. Badges communicate information; they do not trigger actions. If a badge needs to be clickable, use a Chip instead.                                                             |
| Use consistent labels across the product. If a status is called "Active" in one context, it should not be called "Enabled" or "On" elsewhere. Define a fixed vocabulary for status values. | Don't use more than one or two badges in the same row on a single item. Multiple badges compete for attention and dilute meaning. If an item needs many labels, consider an overflow pattern (e.g., +3 more). |
| Use status badges for system or workflow states. Things that change over time and reflect the condition of a record or process are well-suited to status badges.                           | Don't use color alone to convey status. Always include a text label. A green dot without a label is ambiguous to colorblind users and screen readers.                                                         |
| Use label badges for user-defined or editorial categories. Tags, content types, and taxonomy values fit the label variant.                                                                 | Don't use badges for user-entered free text of arbitrary length. If the content can be long or unpredictable, a badge is the wrong component.                                                                 |
| Use count badges sparingly. Reserve them for genuinely actionable counts — unread messages, pending tasks. Don't use them for decorative statistics.                                       | Don't invent new semantic colors. Use the defined color roles. Introducing ad hoc colors undermines the consistency that makes badges meaningful.                                                             |

Use `text` for the primary label and `colorScheme` for its semantic meaning.
`extension` adds one segment; `extensions` adds multiple segments. False, null,
and undefined extensions are omitted. Each extension can override its color and truncation.

Use `truncate` inside a constrained container to shorten the primary label.
