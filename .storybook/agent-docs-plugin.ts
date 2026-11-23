import type { Plugin } from 'vite';

import {
  agentDocsPaths,
  buildLlmsFull,
  buildLlmsIndex,
  loadComponents,
} from './agent-docs';

function agentDocsFiles(root: string, origin: string): Map<string, string> {
  const components = loadComponents(root);
  return new Map([
    [agentDocsPaths.index, buildLlmsIndex(origin, components)],
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
        const origin = `http://${request.headers.host ?? 'localhost'}`;
        const body = agentDocsFiles(root, origin).get(pathname);
        if (body === undefined) return next();
        response.setHeader('Content-Type', 'text/plain; charset=utf-8');
        response.end(body);
      });
    },
    generateBundle() {
      for (const [path, source] of agentDocsFiles(root, '')) {
        this.emitFile({ type: 'asset', fileName: path.slice(1), source });
      }
    },
  };
}
