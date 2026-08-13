# Placeholder icons

Icons in this set that were **not** drawn by design. Each was derived from older
artwork (or from another Io icon) to unblock the holocene → Io migration, and
each is a candidate for replacement with a proper Io drawing.

To swap one out, replace the `d` attribute in the listed component. Nothing else
changes — the export name and every call site stay as they are.

Already replaced by design: `microchip` (node `2224:84384`).

## Derived from holocene's retired icon set

| Icon     | Source            | How it was made                                                                                                                               |
| -------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `invite` | holocene `invite` | 24→16 viewBox, uniform 2/3 scale baked into the coordinates. Person + plus. Used by cloud-ui's "Invite" buttons; Io had no person-plus glyph. |

## Derived from cloud-ui's static assets

| Icon       | Source                                     | How it was made                                                                                                                                                                                                              |
| ---------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `star-ai`  | `cloud-ui static/support-hub/star-ai.svg`  | Artwork was already 16 units inside a 24 viewBox via `translate(4 4)`; the wrapper transform was dropped, no scaling. Four-point sparkle with radiating rays — Io's `star` is a plain five-point outline, a different glyph. |
| `messages` | `cloud-ui static/support-hub/messages.svg` | Artwork was 20×16 inside a 24 viewBox; scaled 0.8 and centred vertically. Two overlapping speech bubbles — Io has no chat/comment icon.                                                                                      |

## Derived from another Io icon

| Icon          | Source     | How it was made                                                                                                                                                        |
| ------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `table-dense` | Io `table` | Same outer frame, corner radius and x-inset; five rows instead of three. Needed for the workflow table's density toggle, which has to show two distinguishable states. |

## Lives outside this set

| Component                                            | Why it is not an Io icon                                                                                                                                                                                                                     |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cloud-ui src/routes/(auth)/login/_saml-icon.svelte` | SAML mark, ported verbatim from `static/logos/saml.svg` (already a 16×16 viewBox). Single use — the login connection picker — so it was kept local rather than added here. Renders through `IconSvgWrapper`, so it behaves like a real icon. |

## Gaps — wanted but absent from Io

Places that still use non-Io artwork because nothing here fits:

| Needed                      | Used by                                                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| hamburger / bars            | `cloud-ui routes/(app)/+layout.svelte` mobile nav toggle (its close ✕ does map to `close`)                                                             |
| solid directional triangles | `ui holocene/keyboard-shortcut/arrow-{up,down,left,right}` — Io's `arrow-*` are line arrows, and `play` is the only solid triangle (right-facing only) |
| Temporal wordmark lockup    | `cloud-ui static/logo-temporal-with-copy.svg` — Io's `temporal` is the mark alone                                                                      |

cloud-ui's `routes/(app)/support` — "so cloud" — is internal only and is out of
scope for this list. It may keep bespoke artwork of its own (for example the
hexagon cluster in `support/cells/_cell-icon.svelte`) as long as it draws it
itself. `routes/(app)/support-hub` is a different, customer-facing route and is
in scope.

## Substitutions where the glyph changed

Not placeholders, but the Io icon differs visibly from what it replaced. Worth a
design pass to confirm these were the intended marks:

| Io icon                 | Replaced                                            | Difference                                                                       |
| ----------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------- |
| `ruby-colorblock`       | `ruby-colorblock.svg` (ui vendor + cloud-ui static) | faceted wireframe gem vs a solid one                                             |
| `rust-colorblock`       | same                                                | teal background vs navy                                                          |
| `typescript-colorblock` | same                                                | "TS" wrapped in a black block                                                    |
| `java-color`            | `cloud-ui static/logo_java.svg`                     | cup only; the old artwork had a "Java" wordmark beneath it, in different colours |
| `spinner`               | holocene `spinner`                                  | filled arc vs a stroked three-quarter arc; shows in every loading `Button`       |
| `temporal-archival`     | holocene `retention`                                | used for the `timer` event category, a direct name rename                        |
