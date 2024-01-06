import type { WorkflowEvents } from '$lib/types/events';

export type NodeDatum = {
  id: string;
  label: string;
  shape: string;
  color: string;
};

export type LinkDatum = {
  id: string;
  source: string;
  target: string;
  active: boolean;
  color: string;
};

export type GraphData = {
  nodes: NodeDatum[];
  links: LinkDatum[];
};

export const getLinks = (history: WorkflowEvents) => {
  const links = [];
  history.forEach((event, i) => {
    if (event.id !== '1') {
      const source = history[i - 1];
      const target = history[i];
      const link = {
        source: source.id,
        target: target.id,
        active: true,
        color: '#35D068',
      };
      links.push(link);
    }
  });
  return links;
};

export const getNodes = (history: WorkflowEvents) => {
  return history.map((event) => {
    return {
      id: event.id,
      label: event.name,
      shape: 'circle',
      color: '#F3E7FF',
      children: [{ id: `child-${event.id}`, label: '', shape: 'circle' }],
    };
  });
};
