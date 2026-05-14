export default async function (
  input1: string,
  input2: object,
  input3: unknown[],
): Promise<string> {
  return `Received ${input1}, ${JSON.stringify(input2)}, and [${input3.join(', ')}]`;
}
