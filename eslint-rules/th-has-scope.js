/**
 * Local ESLint plugin: enforce that every <th> has a `scope` attribute.
 *
 * WCAG 2.1 SC 1.3.1 (Info and Relationships): table header cells must be
 * programmatically associated with their data cells. This codebase is
 * entirely column-oriented, so the correct association is `scope="col"`.
 * The rule autofixes any bare <th> to `<th scope="col">`.
 */

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'require a `scope` attribute on every <th> element',
    },
    fixable: 'code',
    schema: [],
    messages: {
      missingScope:
        '<th> is missing a `scope` attribute (WCAG 2.1 SC 1.3.1). Add scope="col" for column headers.',
    },
  },
  create(context) {
    return {
      SvelteElement(node) {
        if (node.kind !== 'html') return;
        if (!node.name || node.name.name !== 'th') return;

        const attributes = node.startTag?.attributes ?? [];
        const hasScope = attributes.some(
          (attr) =>
            attr.type === 'SvelteAttribute' && attr.key?.name === 'scope',
        );
        if (hasScope) return;

        context.report({
          node,
          messageId: 'missingScope',
          fix(fixer) {
            return fixer.insertTextAfterRange(node.name.range, ' scope="col"');
          },
        });
      },
    };
  },
};

export default {
  meta: {
    name: 'eslint-plugin-local',
    version: '1.0.0',
  },
  rules: {
    'th-has-scope': rule,
  },
};
