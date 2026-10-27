import { error } from '@sveltejs/kit';

import type { EntryGenerator, RequestHandler } from './$types';

import { contractSlugs, getContract } from '$docs/data/contracts';
import { textResponse } from '$docs/data/text-response';

export const prerender = true;

export const entries: EntryGenerator = () =>
  contractSlugs.map((slug) => ({ slug }));

export const GET: RequestHandler = ({ params }) => {
  const contract = getContract(params.slug);
  if (!contract) error(404, `No contract for ${params.slug}`);
  return textResponse(contract.markdown, 'text/markdown');
};
