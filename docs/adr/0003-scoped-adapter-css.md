# Scoped Adapter CSS, not Host Tailwind

Upstream styles are Tailwind 3 plus the Temporal theme plugin; the Host (credimi) uses Tailwind 4 and shadcn, where the same class names mean different tokens. We compile pruned, minified CSS in the Adapter build, root it under `.temporal-ui` (split status vs history sheets), and let components import it. The Host does not copy CSS into `static/`, does not compile Temporal classes with its own Tailwind, and does not use Shadow DOM (Upstream portals to `document.body`).
