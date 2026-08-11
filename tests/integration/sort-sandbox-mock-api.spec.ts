import { expect, test } from '@playwright/test';

test('mock visibility API behaves like the real one', async ({ request }) => {
  const base = '/mock-visibility/namespaces/default';

  const count = await (
    await request.get(`${base}/workflow-count?total=12000000`)
  ).json();
  console.log('count:', count.count);
  expect(count.count).toBe('12000000');

  const clamped = await (
    await request.get(`${base}/workflows?pageSize=5000&total=12000000`)
  ).json();
  console.log('pageSize 5000 ->', clamped.executions.length, 'rows');
  expect(clamped.executions).toHaveLength(1000);

  const orderBy = await request.get(
    `${base}/workflows?query=${encodeURIComponent('ORDER BY StartTime ASC')}`,
  );
  console.log('order by:', (await orderBy.json()).message?.slice(0, 60));
  expect(orderBy.status()).toBe(400);

  // token chain walks forward
  const token = clamped.nextPageToken;
  expect(token).toBeTruthy();
  const second = await (
    await request.get(
      `${base}/workflows?pageSize=1000&total=12000000&nextPageToken=${encodeURIComponent(token)}`,
    )
  ).json();
  expect(second.executions[0].execution.workflowId).not.toBe(
    clamped.executions[0].execution.workflowId,
  );

  // counts over a range match what paging returns
  const now = Date.now();
  const iso = (ms: number) => new Date(ms).toISOString();
  const q = `StartTime >= "${iso(now - 4 * 3600e3)}" AND StartTime < "${iso(now - 3 * 3600e3)}"`;
  const ranged = await (
    await request.get(
      `${base}/workflow-count?total=12000000&query=${encodeURIComponent(q)}`,
    )
  ).json();
  let paged = 0,
    tok = '';
  do {
    const r = await (
      await request.get(
        `${base}/workflows?pageSize=1000&total=12000000&query=${encodeURIComponent(q)}${tok ? `&nextPageToken=${encodeURIComponent(tok)}` : ''}`,
      )
    ).json();
    paged += r.executions.length;
    tok = r.nextPageToken;
  } while (tok);
  console.log('range count:', ranged.count, '| paged:', paged);
  expect(paged).toBe(Number(ranged.count));
});
