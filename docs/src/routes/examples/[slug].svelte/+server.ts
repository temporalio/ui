import { error } from '@sveltejs/kit';

import type { EntryGenerator, RequestHandler } from './$types';

import { exampleSlugs, getExampleSource } from '$docs/data/resources';
import { textResponse } from '$docs/data/text-response';

export const prerender = true;

export const entries: EntryGenerator = () =>
  exampleSlugs.map((slug) => ({ slug }));

export const GET: RequestHandler = ({ params }) => {
  const source = getExampleSource(params.slug);
  if (!source) error(404, `No examples for ${params.slug}`);
  return textResponse(source);
};
