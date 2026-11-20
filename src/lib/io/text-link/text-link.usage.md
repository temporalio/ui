## Usage

```ts
import { TextLink } from '$lib/io/text-link';
```

Text Links take users to another page or resource, either within a sentence or on their own. They match the surrounding text so they don't interrupt reading — use ButtonLink instead when navigation is a primary action that needs button styling.

| Do                                                                                                   | Don't                                                                                                                           |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Write link text that describes the destination, such as "Read the workflow docs".                    | Don't use vague link text such as "click here" or "learn more" on its own. Screen reader users often scan links out of context. |
| Use a trailing arrow icon for links that open an external site, and set `target` and `rel` to match. | Don't use a Text Link for actions such as Save or Delete. Use Button for actions.                                               |
| Let links inherit the surrounding typography, so they fit the sentence they sit in.                  | Don't style a Text Link to look like a button. Use ButtonLink when navigation needs button styling.                             |
| Explain nearby why a link is disabled, so users know what to change.                                 | Don't put several links close together in a sentence. Too many links make the text hard to read and the targets hard to hit.    |

`disabled` removes the destination, prevents click handling, and takes the link
out of the tab order. Native anchor attributes such as `target` and `rel` pass
through. Icons scale with the text; use `LeadingIcon` or `TrailingIcon` to
clarify the link's purpose.
