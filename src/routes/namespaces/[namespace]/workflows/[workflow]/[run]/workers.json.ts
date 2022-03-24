import { getPollers } from '$lib/services/pollers-service';

export async function post({ request, params }): Promise<RequestOutput> {
  const { namespace } = params;
  const { queue } = await request.json();

  const workers = await getPollers({ queue, namespace });

  return {
    body: { workers },
  };
}
