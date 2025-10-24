import Dexie from 'dexie';
import { Card, Category, Transaction, Loan, Settings, FriendLoan } from '../types';

export class MoneyManagementDB extends Dexie {
    cards!: Dexie.Table<Card>;
    categories!: Dexie.Table<Category>;
    transactions!: Dexie.Table<Transaction>;
    loans!: Dexie.Table<Loan>;
    friendLoans!: Dexie.Table<FriendLoan>;
    settings!: Dexie.Table<Settings>;

    constructor() {
        super('MoneyManagementDB');

        // Version 4: Original schema with single categoryId
        this.version(4).stores({
            cards: 'id, name, currency, createdAt',
            categories: 'id, name, createdAt',
            transactions: 'id, type, amount, currency, categoryId, cardId, date, source, loanId, loanPaymentId',
            loans: 'id, name, status, currency, startDate, endDate, createdAt',
            friendLoans: 'id, friendName, status, currency, loanDate, paybackDate, createdAt',
            settings: 'id, defaultCurrency, lastUpdated'
        });

        // Version 5: Updated schema with categoryIds array
        this.version(5).stores({
            cards: 'id, name, currency, createdAt',
            categories: 'id, name, createdAt',
            transactions: 'id, type, amount, currency, cardId, date, source, loanId, loanPaymentId, categoryIds',
            loans: 'id, name, status, currency, startDate, endDate, createdAt',
            friendLoans: 'id, friendName, status, currency, loanDate, paybackDate, createdAt',
            settings: 'id, defaultCurrency, lastUpdated'
        }).upgrade(async (tx) => {
            // Migration from version 4 to 5: Convert categoryId to categoryIds array
            const transactionRecords = await tx.table('transactions').toArray();

            for (const transactionRecord of transactionRecords) {
                // Convert old categoryId to new categoryIds array format
                if ('categoryId' in transactionRecord && !('categoryIds' in transactionRecord)) {
                    const oldTransaction = transactionRecord as any;
                    const newTransaction = {
                        ...oldTransaction,
                        categoryIds: oldTransaction.categoryId ? [oldTransaction.categoryId] : []
                    };

                    // Remove the old categoryId field
                    delete newTransaction.categoryId;

                    // Update the transaction
                    await tx.table('transactions').put(newTransaction);
                }
            }
        });
    }
}

export const db = new MoneyManagementDB();
