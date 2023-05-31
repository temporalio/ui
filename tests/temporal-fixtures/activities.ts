export async function echoInput(input: string): Promise<string> {
  return `Received ${input}`;
}

export async function localEchoInput(input: string): Promise<string> {
  return `Side Effect for ${input}`;
}
