import { describe, expect, it } from 'vitest';

import { changedLines, findCandidates, findIoImports, inScope } from './detect';

describe('imports and changed usages', () => {
  it('handles multiline, aliases, types, both prefixes and first-seen order', () => {
    expect(
      findIoImports(
        `import { Badge } from '$lib/io/badge';
import {\n PageHeader,\n} from "$lib/io/layouts/page-header";
import type { BadgeProps as Props } from '$lib/io/badge';`,
        '$lib/io/',
      ),
    ).toEqual(['badge', 'layouts/page-header']);
    expect(
      findIoImports(
        "import type { ButtonProps } from '$lib/io/button'",
        '$lib/io/',
      ),
    ).toEqual(['button']);
    expect(
      findIoImports(
        "import { Chip } from '@temporalio/ui/io/chip'",
        '@temporalio/ui/io/',
      ),
    ).toEqual(['chip']);
    expect(
      findIoImports(
        "import Badge from '$lib/holocene/badge.svelte'",
        '$lib/io/',
      ),
    ).toEqual([]);
    expect(
      findIoImports("// import { Badge } from '$lib/io/badge'", '$lib/io/'),
    ).toEqual([]);
  });

  it.each([
    'src/lib/io/badge/badge.svelte',
    'src/x.stories.svelte',
    'src/x.test.ts',
    'src/x.spec.ts',
    'README.md',
    '../x.ts',
  ])('excludes %s', (file) => {
    expect(inScope(file)).toBe(false);
  });

  it('accepts caller files', () => {
    expect(inScope('src/routes/(app)/+page.svelte')).toBe(true);
    expect(inScope('src/lib/x.ts')).toBe(true);
  });

  it('uses head hunk lines and includes multiline props, not untouched tags', () => {
    const source =
      '<script>\nimport { Badge as B } from \'$lib/io/badge\';\n</script>\n<B\n text="new"\n/>\n<B text="untouched" />';
    const patch = '@@ -4,3 +4,3 @@\n <B\n- text="old"\n+ text="new"\n />';
    expect([...changedLines(patch)]).toEqual([5]);
    expect(
      findCandidates(source, patch, '$lib/io/', 'x.svelte').candidates,
    ).toEqual([{ component: 'badge', line: 4, endLine: 6 }]);
  });

  it('includes changed type usages and no untouched imports', () => {
    const source =
      "import type { ButtonProps } from '$lib/io/button';\nconst props: ButtonProps = {};";
    expect(
      findCandidates(
        source,
        '@@ -2 +2 @@\n-old\n+const props: ButtonProps = {};',
        '$lib/io/',
        'x.ts',
      ).candidates,
    ).toHaveLength(1);
    expect(
      findCandidates(
        source,
        '@@ -3 +3 @@\n-old\n+unrelated();',
        '$lib/io/',
        'x.ts',
      ).candidates,
    ).toEqual([]);
  });

  it('includes removed multiline props and changed children, and flags indirect script changes', () => {
    const source =
      "<script>\nimport { Badge } from '$lib/io/badge';\nconst text = 'x';\n</script>\n<Badge\n text={text}\n/>";
    expect(
      findCandidates(
        source,
        '@@ -6,2 +6 @@\n text={text}\n- extensions={[]}',
        '$lib/io/',
        'x.svelte',
      ).candidates,
    ).toHaveLength(1);
    expect(
      findCandidates(
        source,
        "@@ -3 +3 @@\n-const text = 'y';\n+const text = 'x';",
        '$lib/io/',
        'x.svelte',
      ).uncertain,
    ).toBe(true);
    const children =
      "import { Button } from '$lib/io/button';\n<Button>\n new text\n</Button>";
    expect(
      findCandidates(
        children,
        '@@ -3 +3 @@\n-old\n+ new text',
        '$lib/io/',
        'x.svelte',
      ).candidates,
    ).toHaveLength(1);
  });

  it('reviews usages affected by a changed import and type usages inside Svelte scripts', () => {
    const source =
      '<script>\nimport { Badge as B } from \'$lib/io/badge\';\n</script>\n<B text="x" />';
    expect(
      findCandidates(
        source,
        "@@ -2 +2 @@\n-import { BadgeStatus as B } from '$lib/io/badge-status';\n+import { Badge as B } from '$lib/io/badge';",
        '$lib/io/',
        'x.svelte',
      ).candidates,
    ).toHaveLength(1);
    const typed =
      '<script lang="ts">\nimport type { ButtonProps } from \'$lib/io/button\';\nconst props: ButtonProps = {};\n</script>';
    expect(
      findCandidates(
        typed,
        '@@ -3 +3 @@\n-old\n+const props: ButtonProps = {};',
        '$lib/io/',
        'x.svelte',
      ).candidates,
    ).toHaveLength(1);
  });

  it('flags unsupported dynamic imports and removed IO usages as coverage gaps', () => {
    expect(
      findCandidates(
        "const b = import('$lib/io/badge')",
        '@@ -0,0 +1 @@\n+new',
        '$lib/io/',
        'x.ts',
      ).uncertain,
    ).toBe(true);
    expect(
      findCandidates(
        'const x = 1',
        "@@ -1 +1 @@\n-<Badge text='x' />\n+const x = 1",
        '$lib/io/',
        'x.svelte',
      ).candidates,
    ).toEqual([]);
  });

  it.each([
    {
      name: 'Svelte URL before a changed Badge',
      file: 'x.svelte',
      source:
        '<script>\nimport { Badge } from \'$lib/io/badge\';\n</script>\n<a href="https://docs.temporal.io">Docs</a> <Badge text="" />',
      patch:
        '@@ -4 +4 @@\n-old\n+<a href="https://docs.temporal.io">Docs</a> <Badge text="" />',
    },
    {
      name: 'URL before a TS binding',
      file: 'x.ts',
      source:
        "import { Badge } from '$lib/io/badge';\nconst p = { href: 'https://x', icon: Badge };",
      patch:
        "@@ -2 +2 @@\n-old\n+const p = { href: 'https://x', icon: Badge };",
    },
    {
      name: 'masked usage after another candidate on the same line',
      file: 'x.svelte',
      source:
        '<script>\nimport { Badge } from \'$lib/io/badge\';\n</script>\n<Badge text="x" /><a href="https://x">Docs</a><Badge text="" />',
      patch:
        '@@ -4 +4 @@\n-old\n+<Badge text="x" /><a href="https://x">Docs</a><Badge text="" />',
    },
    {
      name: 'quoted URL before an alias in Svelte script',
      file: 'x.svelte',
      source:
        "<script>\nimport { Badge as B } from '$lib/io/badge';\nconst p = { href: 'https://x', icon: B };\n</script>",
      patch: "@@ -3 +3 @@\n-old\n+const p = { href: 'https://x', icon: B };",
    },
    {
      name: 'multiline typed props',
      file: 'x.ts',
      source:
        "import type { ButtonProps } from '$lib/io/button';\nconst p: ButtonProps = {\n size: 'md',\n};",
      patch: "@@ -3 +3 @@\n- size: 'sm',\n+ size: 'md',",
    },
    {
      name: 'deletion-only typed props',
      file: 'x.ts',
      source:
        "import type { ButtonProps as Props } from '$lib/io/button';\nconst p: Props = {\n};",
      patch: "@@ -2,3 +2,2 @@\n const p: Props = {\n- size: 'sm',\n };",
    },
    {
      name: 'indirect TS initializer',
      file: 'x.ts',
      source:
        "import type { ButtonProps } from '$lib/io/button';\nconst size = 'md';\nconst p: ButtonProps = { size };",
      patch: "@@ -2 +2 @@\n-const size = 'sm';\n+const size = 'md';",
    },
    {
      name: 'raw ambiguity after comment masking',
      file: 'x.svelte',
      source:
        "<script>\nimport { Badge } from '$lib/io/badge';\n</script>\n<!-- Badge context changed -->",
      patch: '@@ -4 +4 @@\n-old\n+<!-- Badge context changed -->',
    },
  ])(
    'marks $name uncertain instead of proving clean',
    ({ file, source, patch }) => {
      expect(findCandidates(source, patch, '$lib/io/', file).uncertain).toBe(
        true,
      );
    },
  );

  it('keeps complete coverage for direct TS references and actual no-IO files', () => {
    expect(
      findCandidates(
        "import type { ButtonProps } from '$lib/io/button';\nconst p: ButtonProps = {};",
        '@@ -2 +2 @@\n-old\n+const p: ButtonProps = {};',
        '$lib/io/',
        'x.ts',
      ).uncertain,
    ).toBe(false);
    expect(
      findCandidates(
        'const x = 1;',
        '@@ -1 +1 @@\n-old\n+const x = 1;',
        '$lib/io/',
        'x.ts',
      ),
    ).toEqual({ candidates: [], uncertain: false });
  });

  it.each([
    {
      name: 'unchanged URL-masked opening with changed prop',
      source:
        '<script>\nimport { Badge } from \'$lib/io/badge\';\n</script>\n<a href="https://docs"><Badge\n text=""\n/></a>',
      patch: '@@ -5 +5 @@\n- text="Active"\n+ text=""',
    },
    {
      name: 'unchanged alias opening with deleted prop',
      source:
        '<script>\nimport { Badge as Label } from \'$lib/io/badge\';\n</script>\n<a href="https://docs"><Label\n/></a>',
      patch: '@@ -5 +5,0 @@\n- text="Active"',
    },
    {
      name: 'markup block delimiter masks a later tag',
      source:
        '<script>\nimport { Badge } from \'$lib/io/badge\';\n</script>\n<a href="/api/*">\n<Badge\n text=""\n/>\n</a>\n<style>/* Later comment */</style>',
      patch: '@@ -6 +6 @@\n- text="Active"\n+ text=""',
    },
    {
      name: 'masked tag elsewhere in a changed file',
      source:
        '<script>\nimport { Badge } from \'$lib/io/badge\';\n</script>\n<a href="https://docs"><Badge text="Active" /></a>\n<p>Changed</p>',
      patch: '@@ -5 +5 @@\n-<p>Old</p>\n+<p>Changed</p>',
    },
    {
      name: 'real comment with a raw IO opening tag',
      source:
        '<script>\nimport { Badge } from \'$lib/io/badge\';\n</script>\n<!-- <Badge text="Active" /> -->\n<p>Changed</p>',
      patch: '@@ -5 +5 @@\n-<p>Old</p>\n+<p>Changed</p>',
    },
  ])(
    'limits coverage for $name without inventing candidates',
    ({ source, patch }) => {
      expect(findCandidates(source, patch, '$lib/io/', 'x.svelte')).toEqual({
        candidates: [],
        uncertain: true,
      });
    },
  );

  it('retains known candidates when another unchanged opening tag is masked', () => {
    const source =
      '<script>\nimport { Badge } from \'$lib/io/badge\';\n</script>\n<Badge text="" />\n<a href="https://docs"><Badge\n text=""\n/></a>';
    const result = findCandidates(
      source,
      '@@ -4,3 +4,3 @@\n-<Badge text="Active" />\n+<Badge text="" />\n <a href="https://docs"><Badge\n- text="Active"\n+ text=""',
      '$lib/io/',
      'x.svelte',
    );
    expect(result).toEqual({
      candidates: [{ component: 'badge', line: 4, endLine: 4 }],
      uncertain: true,
    });
  });

  describe.each(['Badge', 'StatusLabel', '_Label'])(
    'file-wide references to %s',
    (binding) => {
      it.each([
        {
          name: 'dynamic component',
          script: '',
          markup: (name: string) =>
            `<svelte:component\n this={${name}}\n text=""\n/>`,
        },
        {
          name: 'script alias',
          script: 'const Local = BINDING;',
          markup: () => '<Local text="" />',
        },
        {
          name: 'markup const',
          script: '',
          markup: (name: string) =>
            `{#if true}\n{@const C = ${name}}\n<C text="" />\n{/if}`,
        },
        {
          name: 'container shorthand',
          script: 'const components = { BINDING };',
          markup: (name: string) => `<components.${name} text="" />`,
        },
        {
          name: 'factory call',
          script: 'const Local = decorate(BINDING);',
          markup: () => '<Local text="" />',
        },
        {
          name: 'comment mention',
          script: '// BINDING is described here',
          markup: () => '<p>Example</p>',
        },
        {
          name: 'string mention',
          script: "const label = 'BINDING';",
          markup: () => '<p>Example</p>',
        },
      ])(
        'limits $name even when its reference is unchanged',
        ({ script, markup }) => {
          const specifier =
            binding === 'Badge' ? 'Badge' : `Badge as ${binding}`;
          const source = `<script>\nimport { ${specifier} } from '$lib/io/badge';\n${script.replaceAll('BINDING', binding)}\n</script>\n${markup(binding)}\n<p>Changed</p>`;
          const line = source.split('\n').length;
          const result = findCandidates(
            source,
            `@@ -${line} +${line} @@\n-<p>Old</p>\n+<p>Changed</p>`,
            '$lib/io/',
            'x.svelte',
          );
          expect(result).toEqual({ candidates: [], uncertain: true });
        },
      );
    },
  );

  it('does not let a direct candidate cover a value reference on the same line', () => {
    const source =
      '<script>\nimport { Badge } from \'$lib/io/badge\';\n</script>\n<Badge text="" /><svelte:component this={Badge}\n text=""\n/>';
    const patch =
      '@@ -4,2 +4,2 @@\n-<Badge text="Active" /><svelte:component this={Badge}\n+<Badge text="" /><svelte:component this={Badge}\n- text="Active"\n+ text=""';
    expect(findCandidates(source, patch, '$lib/io/', 'x.svelte')).toEqual({
      candidates: [{ component: 'badge', line: 4, endLine: 4 }],
      uncertain: true,
    });
  });

  it('limits namespace member references without resolving them', () => {
    const source =
      '<script>\nimport * as Status from \'$lib/io/badge\';\n</script>\n<Status.Badge\n text=""\n/>';
    expect(
      findCandidates(
        source,
        '@@ -5 +5 @@\n- text="Active"\n+ text=""',
        '$lib/io/',
        'x.svelte',
      ),
    ).toEqual({ candidates: [], uncertain: true });
  });

  it.each([
    {
      source:
        "<script>\nimport { Badge } from '$lib/io/badge';\n</script>\n<Badge>\nSave\n</Badge>",
      patch: '@@ -5 +5 @@\n-Old\n+Save',
      candidates: 1,
    },
    {
      source:
        '<script>\nimport { Badge as Label } from \'$lib/io/badge\';\n</script>\n<Label\n text="Active"\n/>',
      patch: '@@ -5 +5 @@\n- text="Old"\n+ text="Active"',
      candidates: 1,
    },
    {
      source:
        "<script>\nimport { Badge } from '$lib/io/badge';\n</script>\n<Badge\n/>",
      patch: '@@ -5 +5,0 @@\n- text="Old"',
      candidates: 1,
    },
    {
      source:
        "<script>\nimport { Badge } from '$lib/io/badge';\nconst BadgeStatus = 'Active';\n</script>\n<p>{BadgeStatus}</p>",
      patch: '@@ -5 +5 @@\n-old\n+<p>{BadgeStatus}</p>',
      candidates: 0,
    },
    {
      source:
        "<script>\nimport { Badge } from '$lib/io/badge';\n</script>\n<p>Changed</p>",
      patch: '@@ -4 +4 @@\n-old\n+<p>Changed</p>',
      candidates: 0,
    },
    {
      source:
        '<script>\nimport Badge from \'$lib/holocene/badge.svelte\';\n</script>\n<Badge text="Active" />',
      patch: '@@ -4 +4 @@\n-old\n+<Badge text="Active" />',
      candidates: 0,
    },
    {
      source: '<p>No IO</p>',
      patch: '@@ -1 +1 @@\n-old\n+<p>No IO</p>',
      candidates: 0,
    },
  ])(
    'keeps supported direct/no-IO coverage complete %#',
    ({ source, patch, candidates }) => {
      const result = findCandidates(source, patch, '$lib/io/', 'x.svelte');
      expect(result.uncertain).toBe(false);
      expect(result.candidates).toHaveLength(candidates);
    },
  );

  it.each([
    {
      name: 'markup const',
      markup: "{#if true}\n{@const label = ''}\n<IO text={label} />\n{/if}",
      line: 5,
      old: "{@const label = 'Active'}",
      next: "{@const label = ''}",
    },
    {
      name: 'each source',
      markup: "{#each [''] as label}\n<IO text={label} />\n{/each}",
      line: 4,
      old: "{#each ['Active'] as label}",
      next: "{#each [''] as label}",
    },
    {
      name: 'snippet default',
      markup:
        "{#snippet row(label = '')}\n<IO text={label} />\n{/snippet}\n{@render row()}",
      line: 4,
      old: "{#snippet row(label = 'Active')}",
      next: "{#snippet row(label = '')}",
    },
    {
      name: 'await source',
      markup:
        "{#await Promise.resolve('')}\n{:then label}\n<IO text={label} />\n{/await}",
      line: 4,
      old: "{#await Promise.resolve('Active')}",
      next: "{#await Promise.resolve('')}",
    },
    {
      name: 'then binding',
      markup: '{#await promise}\n{:then label}\n<IO text={label} />\n{/await}',
      line: 5,
      old: '{:then other}',
      next: '{:then label}',
    },
    {
      name: 'catch binding',
      markup: '{#await promise}\n{:catch label}\n<IO text={label} />\n{/await}',
      line: 5,
      old: '{:catch other}',
      next: '{:catch label}',
    },
    {
      name: 'ordinary condition',
      markup: '{#if ready}\n<IO text="Active" />\n{/if}',
      line: 4,
      old: '{#if loading}',
      next: '{#if ready}',
    },
    {
      name: 'unrelated markup',
      markup: '<IO text="Active" />\n<p>New</p>',
      line: 5,
      old: '<p>Old</p>',
      next: '<p>New</p>',
    },
    {
      name: 'comment formatting',
      markup: '<IO text="Active" />\n<!-- New -->',
      line: 5,
      old: '<!-- Old -->',
      next: '<!-- New -->',
    },
    {
      name: 'blank formatting',
      markup: '<IO text="Active" />\n',
      line: 5,
      old: ' ',
      next: '',
    },
  ])(
    'limits unmatched $name beside an unchanged IO reference',
    ({ markup, line, old, next }) => {
      for (const binding of ['Badge', 'StatusLabel']) {
        const specifier = binding === 'Badge' ? 'Badge' : `Badge as ${binding}`;
        const source = `<script>\nimport { ${specifier} } from '$lib/io/badge';\n</script>\n${markup.replaceAll('IO', binding)}`;
        expect(
          findCandidates(
            source,
            `@@ -${line} +${line} @@\n-${old}\n+${next}`,
            '$lib/io/',
            'x.svelte',
          ),
        ).toEqual({ candidates: [], uncertain: true });
      }
    },
  );

  it('limits deletion-only context edits even when their anchor is the next unchanged tag', () => {
    const source =
      "<script>\nimport { Badge as Status } from '$lib/io/badge';\n</script>\n{#each items as label}\n<Status text={label} />\n{/each}";
    expect(
      findCandidates(
        source,
        "@@ -5 +5,0 @@\n-{@const label = ''}",
        '$lib/io/',
        'x.svelte',
      ),
    ).toEqual({ candidates: [], uncertain: true });
  });

  it('limits mixed unmatched context even with a known changed candidate', () => {
    const source =
      '<script>\nimport { Badge } from \'$lib/io/badge\';\n</script>\n<Badge text="" />\n<p>New</p>';
    expect(
      findCandidates(
        source,
        '@@ -4,2 +4,2 @@\n-<Badge text="Old" />\n+<Badge text="" />\n-<p>Old</p>\n+<p>New</p>',
        '$lib/io/',
        'x.svelte',
      ),
    ).toEqual({
      candidates: [{ component: 'badge', line: 4, endLine: 4 }],
      uncertain: true,
    });
  });

  it.each([
    {
      source:
        "<script>\nimport { Badge } from '$lib/io/badge';\nconst label = 'New';\n</script>\n<p>{label}</p>",
      patch: "@@ -3 +3 @@\n-const label = 'Old';\n+const label = 'New';",
    },
    {
      source:
        "<script>\nimport { Badge } from '$lib/io/badge';\n</script>\n<p>New</p>",
      patch: '@@ -4 +4 @@\n-<Badge text="Old" />\n+<p>New</p>',
    },
    {
      source:
        "<script>\nimport Badge from '$lib/holocene/badge.svelte';\nconst label = 'New';\n</script>\n<Badge text={label} />",
      patch: "@@ -3 +3 @@\n-const label = 'Old';\n+const label = 'New';",
    },
  ])(
    'does not confuse import presence with active IO references %#',
    ({ source, patch }) => {
      expect(findCandidates(source, patch, '$lib/io/', 'x.svelte')).toEqual({
        candidates: [],
        uncertain: false,
      });
    },
  );
});
