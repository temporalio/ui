## Usage

```ts
import { Breadcrumbs } from '$lib/io/breadcrumbs';
```

Breadcrumbs display the current page, allows for navigation to different levels of the hierarchy.

| Do                                                                                                                                                 | Don't                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Reflect the real page hierarchy, from the broadest level down to the current page, such as Namespaces › production › Workflows › order-processing. | Don't use breadcrumbs to show the user's browsing history. They describe where a page sits, not how the user got there. |
| Use the same names as the pages they link to, so each crumb matches the title users see when they arrive.                                          | Don't use breadcrumbs on top-level pages. A single crumb adds noise without helping users navigate.                     |
| Place breadcrumbs at the top of the page, above the page title.                                                                                    | Don't replace primary navigation with breadcrumbs. They are a secondary aid for moving up the hierarchy.                |
| Keep labels short. Use the object's name or ID rather than a full description.                                                                     | Don't add actions, menus, or icons to crumbs. Each crumb should be a plain link.                                        |

Pass `items` in hierarchy order, each with a `label` and `href`. The final item
receives `aria-current="page"`; separators are decorative. The navigation has a
translated accessible label, which can be overridden with `aria-label`.

The trail wraps when space is constrained.
