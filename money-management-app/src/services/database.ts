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
        this.version(4).stores({
            cards: 'id, name, currency, createdAt',
            categories: 'id, name, createdAt',
            transactions: 'id, type, amount, currency, categoryId, cardId, date, source, loanId, loanPaymentId',
            loans: 'id, name, status, currency, startDate, endDate, createdAt',
            friendLoans: 'id, friendName, status, currency, loanDate, paybackDate, createdAt',
            settings: 'id, defaultCurrency, lastUpdated'
        });
    }
}

export const db = new MoneyManagementDB();
