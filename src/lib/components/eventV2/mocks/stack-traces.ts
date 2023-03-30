export const enhancedStackTrace = {
  sdk: {
    name: 'typescript',
    version: '1.6.0',
  },
  stacks: [
    {
      locations: [
        {
          filePath:
            '/Users/alex.tideman/Temporal/samples-typescript/expense/src/workflows.ts',
          functionName: 'createExpense',
          line: 28,
          column: 8,
          awaitableId: 5,
        },
        {
          filePath:
            '/Users/alex.tideman/Temporal/samples-typescript/expense/src/workflows.ts',
          functionName: 'timeoutOrUserAction',
          line: 29,
          column: 8,
          awaitableId: 6,
        },
        {
          filePath:
            '/Users/alex.tideman/Temporal/samples-typescript/expense/src/workflows.ts',
          functionName: 'payment',
          line: 33,
          column: 8,
          awaitableId: 6,
        },
      ],
    },
  ],
  sources: {
    '/Users/alex.tideman/Temporal/samples-typescript/expense/src/workflows.ts':
      [
        {
          content:
            "import * as wf from '@temporalio/workflow';\nimport type * as activities from './activities';\n\nexport enum ExpenseStatus {\n  CREATED = 'CREATED',\n  APPROVED = 'APPROVED',\n  REJECTED = 'REJECTED',\n  TIMED_OUT = 'TIMED_OUT',\n  COMPLETED = 'COMPLETED',\n}\n\nexport const approveSignal = wf.defineSignal('approve');\nexport const rejectSignal = wf.defineSignal('reject');\n\nconst { createExpense, payment } = wf.proxyActivities<typeof activities>({\n  startToCloseTimeout: '5 minutes',\n});\n\nexport function timeoutOrUserAction(timeout: string): Promise<ExpenseStatus> {\n  return new Promise((resolve, reject) => {\n    wf.setHandler(approveSignal, () => resolve(ExpenseStatus.APPROVED));\n    wf.setHandler(rejectSignal, () => resolve(ExpenseStatus.REJECTED));\n    wf.sleep(timeout).then(() => resolve(ExpenseStatus.TIMED_OUT), reject);\n  });\n}\n\nexport async function expense(expenseId: string, timeout = '10s'): Promise<{ status: ExpenseStatus }> {\n  await createExpense(expenseId);\n  const status = await timeoutOrUserAction(timeout);\n  if (status !== ExpenseStatus.APPROVED) {\n    return { status };\n  }\n  await payment(expenseId);\n  return { status: ExpenseStatus.COMPLETED };\n}\n",
          lineOffset: 0,
        },
      ],
  },
};

export const timeTravelEnhancedStackTrace = {
  sdk: {
    name: 'typescript',
    version: '1.6.0',
  },
  stacks: {
    1: [
      {
        locations: [
          {
            filePath:
              '/Users/alex.tideman/Temporal/samples-typescript/expense/src/workflows.ts',
            functionName: 'createExpense',
            line: 28,
            column: 8,
            awaitableId: 5,
          },
        ],
      },
    ],
    2: [
      {
        locations: [
          {
            filePath:
              '/Users/alex.tideman/Temporal/samples-typescript/expense/src/workflows.ts',
            functionName: 'createExpense',
            line: 28,
            column: 8,
            awaitableId: 5,
          },
          {
            filePath:
              '/Users/alex.tideman/Temporal/samples-typescript/expense/src/workflows.ts',
            functionName: 'timeoutOrUserAction',
            line: 29,
            column: 8,
            awaitableId: 6,
          },
        ],
      },
    ],
    3: [
      {
        locations: [
          {
            filePath:
              '/Users/alex.tideman/Temporal/samples-typescript/expense/src/workflows.ts',
            functionName: 'payment',
            line: 33,
            column: 8,
            awaitableId: 6,
          },
        ],
      },
    ],
  },
  sources: {
    '/Users/alex.tideman/Temporal/samples-typescript/expense/src/workflows.ts':
      [
        {
          content:
            "import * as wf from '@temporalio/workflow';\nimport type * as activities from './activities';\n\nexport enum ExpenseStatus {\n  CREATED = 'CREATED',\n  APPROVED = 'APPROVED',\n  REJECTED = 'REJECTED',\n  TIMED_OUT = 'TIMED_OUT',\n  COMPLETED = 'COMPLETED',\n}\n\nexport const approveSignal = wf.defineSignal('approve');\nexport const rejectSignal = wf.defineSignal('reject');\n\nconst { createExpense, payment } = wf.proxyActivities<typeof activities>({\n  startToCloseTimeout: '5 minutes',\n});\n\nexport function timeoutOrUserAction(timeout: string): Promise<ExpenseStatus> {\n  return new Promise((resolve, reject) => {\n    wf.setHandler(approveSignal, () => resolve(ExpenseStatus.APPROVED));\n    wf.setHandler(rejectSignal, () => resolve(ExpenseStatus.REJECTED));\n    wf.sleep(timeout).then(() => resolve(ExpenseStatus.TIMED_OUT), reject);\n  });\n}\n\nexport async function expense(expenseId: string, timeout = '10s'): Promise<{ status: ExpenseStatus }> {\n  await createExpense(expenseId);\n  const status = await timeoutOrUserAction(timeout);\n  if (status !== ExpenseStatus.APPROVED) {\n    return { status };\n  }\n  await payment(expenseId);\n  return { status: ExpenseStatus.COMPLETED };\n}\n",
          lineOffset: 0,
        },
      ],
  },
};
