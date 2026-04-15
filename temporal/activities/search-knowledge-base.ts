type SearchInput = {
  query: string;
  collection: string;
  topK: number;
};

export default async function searchKnowledgeBase(
  input: SearchInput,
): Promise<Record<string, unknown>> {
  return {
    result: `Found 47 results for "${input.query}" in ${input.collection}`,
    _details: {
      totalResults: 47,
      collection: input.collection,
      topK: input.topK,
      latencyMs: 84,
      topHits: [
        { title: 'Temporal Production Deployment Guide', score: 0.94 },
        { title: 'Cluster Configuration Best Practices', score: 0.87 },
        { title: 'Scaling Temporal Workers', score: 0.72 },
      ],
    },
  };
}
