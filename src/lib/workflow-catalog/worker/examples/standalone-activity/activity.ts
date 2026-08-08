export async function standaloneActivity({
  name,
}: {
  name: string;
}): Promise<string> {
  return `Guten tag ${name}!`;
}
