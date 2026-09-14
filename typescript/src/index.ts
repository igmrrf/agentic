/**
 * Agentic Engineering Standards reference TypeScript service.
 * Demonstrates erasable syntax, isolated declarations, and strict type safety.
 */

export const TransactionStatus = {
  Pending: 'pending',
  Completed: 'completed',
  Failed: 'failed',
} as const;

export type TransactionStatus =
  (typeof TransactionStatus)[keyof typeof TransactionStatus];

export interface Transaction {
  readonly id: string;
  readonly amountMinor: number;
  readonly status: TransactionStatus;
}

export interface FormattedTransaction {
  readonly transactionId: string;
  readonly displayAmount: string;
  readonly status: TransactionStatus;
}

/**
 * Transforms a list of transactions into formatted display models.
 * Strictly uses .map() because it produces and returns a new transformed array.
 */
export function formatTransactions(
  transactions: readonly Transaction[]
): FormattedTransaction[] {
  return transactions.map(
    (transaction: Transaction): FormattedTransaction => ({
      transactionId: transaction.id,
      displayAmount: `$${(transaction.amountMinor / 100).toFixed(2)}`,
      status: transaction.status,
    })
  );
}

/**
 * Dispatches notification events for transactions.
 * Strictly uses a for...of loop for side effects with no returned data.
 */
export function notifyTransactions(
  transactions: readonly Transaction[],
  notifier: (transactionId: string) => void
): void {
  for (const transaction of transactions) {
    notifier(transaction.id);
  }
}
