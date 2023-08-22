import rehypeDocument from 'rehype-document';
import rehypeFormat from 'rehype-format';
import stringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import toc from 'remark-toc';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import { AccessibilityViolationSummary } from './summarize';

type Node = {
  value: string;
  type: string;
};

function escapeHTML() {
  return (tree: Node) => {
    visit(tree, 'html', (node: Node) => {
      node.type = 'text';
      node.value = `\`${node.value}\``; // Wrap in backticks
    });
  };
}

const css = `
html {
  font-size: 18px;
  max-width: 100%;
}

body {
  max-width: 48rem;
  padding: 0.25rem;
  margin: auto;
  line-height: 1.85;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

pre,
code {
  font-family: Menlo, Monaco, 'Courier New', monospace;
  background-color: #fafafa;
}

pre {
  padding: 0.5rem;
  line-height: 1.25;
  overflow-x: scroll;
}

p {
  font-size: 1rem;
  margin-bottom: 1.3rem;
}

h1,
h2,
h3,
h4 {
  margin: 1.414rem 0 0.5rem;
  font-weight: inherit;
  line-height: 1.42;
}

h1 {
  font-size: 2rem;
}

h2 {
  font-size: 1.5rem;
}



blockquote {
  border-left: 8px solid #fafafa;
  padding: 1rem;
}
`;

const processor = unified()
  .use(remarkParse)
  .use(escapeHTML)
  .use(toc)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeDocument, { title: 'Accessibility Report', style: css })
  .use(rehypeFormat)
  .use(stringify);

const renderNode = (node: AccessibilityViolationSummary['nodes'][number]) => {
  const [fix, ...summary] = node.failureSummary.split('\n');

  return [
    `- \`${node.target.join(' ')}\` — ${fix}`,
    summary.map((line) => `  - ${line}`).join('\n'),
    `  - This is the markup in question: \`${node.html}\``,
    `  - ![Screenshot](data:image/png;base64,${node.screenshot})`,
  ].join('\n');
};

export const toMarkdown = async (
  data: AccessibilityViolationSummary | AccessibilityViolationSummary[],
): Promise<string> => {
  if (Array.isArray(data)) {
    const combined = await Promise.all(
      data.map(async (d) => await toMarkdown(d)),
    );

    const content = combined.join('\n\n---\n\n');

    const html = await processor.process(content);

    return html.toString();
  } else {
    return [
      `# Accessibility Issue: (${data.impact}) ${data.url} — ${data.issueType}`,
      `**Issue**: [${data.help}](${data.helpUrl})`,
      `**Why?**: ${data.description}`,
      data.nodes.map(renderNode).join('\n\n'),
    ].join('\n\n');
  }
};
