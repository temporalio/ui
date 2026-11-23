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
});
