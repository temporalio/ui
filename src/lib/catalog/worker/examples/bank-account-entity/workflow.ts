import {
  allHandlersFinished,
  condition,
  continueAsNew,
  defineQuery,
  defineSignal,
  defineUpdate,
  setHandler,
  workflowInfo,
} from '@temporalio/workflow';

export type BankAccountState = {
  balanceCents: number;
  continueAsNewEvery: number;
};

const depositUpdate = defineUpdate<number, [number]>('deposit');
const withdrawUpdate = defineUpdate<number, [number]>('withdraw');
const balanceQuery = defineQuery<number>('balance');
const closeAccountSignal = defineSignal('close-account');

const validateAmount = (amountCents: number) => {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error('Amount must be a positive whole number of cents');
  }
};

export async function bankAccountEntity({
  balanceCents,
  continueAsNewEvery,
}: BankAccountState): Promise<string> {
  let balance = balanceCents;
  let operations = 0;
  let closeRequested = false;

  setHandler(
    depositUpdate,
    (amountCents) => {
      balance += amountCents;
      operations += 1;
      return balance;
    },
    { validator: validateAmount },
  );
  setHandler(
    withdrawUpdate,
    (amountCents) => {
      balance -= amountCents;
      operations += 1;
      return balance;
    },
    {
      validator: (amountCents) => {
        validateAmount(amountCents);
        if (amountCents > balance) {
          throw new Error(
            `Insufficient funds: balance is ${balance} cents, withdrawal is ${amountCents} cents`,
          );
        }
      },
    },
  );
  setHandler(balanceQuery, () => balance);
  setHandler(closeAccountSignal, () => {
    closeRequested = true;
  });

  await condition(
    () =>
      closeRequested ||
      operations >= continueAsNewEvery ||
      workflowInfo().continueAsNewSuggested,
  );
  await condition(allHandlersFinished);

  if (closeRequested) {
    return `Account ${workflowInfo().workflowId} closed with a balance of ${balance} cents`;
  }

  return continueAsNew<typeof bankAccountEntity>({
    balanceCents: balance,
    continueAsNewEvery,
  });
}
