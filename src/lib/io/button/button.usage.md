## Usage

```ts
import { Button, ButtonLink } from '$lib/io/button';
```

Buttons trigger actions. They are the primary means by which users interact with a product.

| Do                                                                                                                                                            | Don't                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Start labels with a verb that says what will happen, such as "Start workflow" or "Save changes".                                                              | Don't use more than one primary button in the same area. A single primary action keeps the next step clear.           |
| Match the color scheme to the action's importance: primary for the main action, secondary or tertiary for supporting actions, ghost for low-emphasis actions. | Don't use danger for anything other than destructive actions, such as terminating a workflow or deleting a namespace. |
| Show a loading state with `isLoading` while the action runs, so users know it was received.                                                                   | Don't use a Button to navigate to another page. Use ButtonLink, or TextLink when the link sits within text.           |
| Give icon-only buttons an accessible label that describes the action.                                                                                         | Don't disable a button without explaining why nearby. Users should know what to change to enable it.                  |
| Choose a `size` that fits the surrounding layout, such as `sm` or `xs` in dense tables and toolbars.                                                          | Don't mix button sizes within the same group of actions.                                                              |
| Set `type="submit"` explicitly on the button that submits a form.                                                                                             | Don't rely on the default button type to submit forms.                                                                |

`Button` and `ButtonLink` are both exported from `$lib/io/button`. The
`tracking` prop accepts overrides for name, intent, and text, or `false` to opt
out of the default tracking attributes.
