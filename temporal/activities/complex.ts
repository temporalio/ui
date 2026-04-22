import { ApplicationFailure } from '@temporalio/activity';

export interface ComplexActivityInput {
  strings: string[];
  numbers: number[];
  nested: { key: string; count: number; tags: string[] };
  flag: boolean;
  nullable: null;
  shouldFail?: boolean;
}

export interface ComplexActivityResult {
  processed: ComplexActivityInput;
  summary: string;
  timestamp: number;
}

export async function complex(
  input: ComplexActivityInput,
): Promise<ComplexActivityResult> {
  if (input.shouldFail) {
    throw ApplicationFailure.create({
      message: 'Deliberate failure for Payload coverage',
      details: [{ reason: 'test', input }],
    });
  }
  return {
    processed: input,
    summary: `Processed ${input.strings.length} strings and ${input.numbers.length} numbers`,
    timestamp: Date.now(),
  };
}
