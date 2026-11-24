import type { Plugin } from 'vite';

import {
  agentDocsPaths,
  buildLlmsFull,
  buildLlmsIndex,
  loadComponents,
} from './agent-docs';

const isAgentDocsPath = (pathname: string) =>
  pathname === agentDocsPaths.index ||
  pathname === agentDocsPaths.full ||
  /^\/io\/[^/]+\.md$/.test(pathname);

function agentDocsFiles(root: string): Map<string, string> {
  const components = loadComponents(root);
  return new Map([
    [agentDocsPaths.index, buildLlmsIndex(components)],
    [agentDocsPaths.full, buildLlmsFull(components)],
    ...components.map(
      (component) =>
        [agentDocsPaths.component(component.slug), component.markdown] as const,
    ),
  ]);
}

export function agentDocsPlugin(root: string): Plugin {
  return {
    name: 'io-agent-docs',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost')
          .pathname;
        if (!isAgentDocsPath(pathname)) return next();
        const body = agentDocsFiles(root).get(pathname);
        if (body === undefined) return next();
        response.setHeader('Content-Type', 'text/plain; charset=utf-8');
        response.end(body);
      });
    },
    generateBundle() {
      for (const [path, source] of agentDocsFiles(root)) {
        this.emitFile({ type: 'asset', fileName: path.slice(1), source });
      }
    },
  };
}
