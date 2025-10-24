import { db } from './database';
import { Card, Category, Transaction, Loan, Settings, LoanPayment, FriendLoan, FriendLoanPayment } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Export migration service
export { MigrationService } from './migrationService';

// Cards Service
export const cardsService = {
    async getAll(): Promise<Card[]> {
        return await db.cards.orderBy('createdAt').reverse().toArray();
    },

    async getById(id: string): Promise<Card | undefined> {
        return await db.cards.get(id);
    },

    async create(card: Omit<Card, 'id' | 'createdAt'>): Promise<Card> {
        const newCard: Card = {
            ...card,
            id: uuidv4(),
            createdAt: Date.now(),
        };
        await db.cards.add(newCard);
        return newCard;
    },

    async update(id: string, updates: Partial<Card>): Promise<void> {
        await db.cards.update(id, updates);
    },

    async delete(id: string): Promise<void> {
        await db.cards.delete(id);
    },

    async updateBalance(id: string, amount: number, operation: 'add' | 'subtract'): Promise<void> {
        const card = await this.getById(id);
        if (card) {
            const newBalance = operation === 'add'
                ? card.balance + amount
                : card.balance - amount;
            await this.update(id, { balance: newBalance });
        }
    }
};

// Categories Service
export const categoriesService = {
    async getAll(): Promise<Category[]> {
        return await db.categories.orderBy('createdAt').reverse().toArray();
    },

    async getById(id: string): Promise<Category | undefined> {
        return await db.categories.get(id);
    },

    async create(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
        const newCategory: Category = {
            ...category,
            id: uuidv4(),
            createdAt: Date.now(),
        };
        await db.categories.add(newCategory);
        return newCategory;
    },

    async update(id: string, updates: Partial<Category>): Promise<void> {
        await db.categories.update(id, updates);
    },

    async delete(id: string): Promise<void> {
        await db.categories.delete(id);
    }
};

// Transactions Service
export const transactionsService = {
    async getAll(): Promise<Transaction[]> {
        return await db.transactions.orderBy('date').reverse().toArray();
    },

    async getById(id: string): Promise<Transaction | undefined> {
        return await db.transactions.get(id);
    },

    async getByCard(cardId: string): Promise<Transaction[]> {
        return await db.transactions.where('cardId').equals(cardId).reverse().sortBy('date');
    },

    async getByCategory(categoryId: string): Promise<Transaction[]> {
        // Use Dexie's multiEntry index for efficient array queries
        return await db.transactions.where('categoryIds').equals(categoryId).reverse().sortBy('date');
    },

    async getByDateRange(startDate: number, endDate: number): Promise<Transaction[]> {
        return await db.transactions
            .where('date')
            .between(startDate, endDate)
            .reverse()
            .sortBy('date');
    },

    async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
        const newTransaction: Transaction = {
            ...transaction,
            id: uuidv4(),
        };

        await db.transactions.add(newTransaction);

        // Update card balance if it's an income, expense, loan payment, or friend loan payback
        if (transaction.cardId && (transaction.type === 'income' || transaction.type === 'expense' || transaction.type === 'loan_payment' || transaction.type === 'friend_loan_payback')) {
            const operation = (transaction.type === 'income' || transaction.type === 'friend_loan_payback') ? 'add' : 'subtract';
            await cardsService.updateBalance(transaction.cardId, transaction.amount, operation);
        }

        return newTransaction;
    },

    async update(id: string, updates: Partial<Transaction>): Promise<void> {
        const oldTransaction = await this.getById(id);
        if (!oldTransaction) return;

        // Revert old balance changes
        if (oldTransaction.cardId && (oldTransaction.type === 'income' || oldTransaction.type === 'expense' || oldTransaction.type === 'loan_payment')) {
            const operation = oldTransaction.type === 'income' ? 'subtract' : 'add';
            await cardsService.updateBalance(oldTransaction.cardId, oldTransaction.amount, operation);
        }

        // Apply new transaction
        await db.transactions.update(id, updates);

        // Apply new balance changes
        const newTransaction = { ...oldTransaction, ...updates };
        if (newTransaction.cardId && (newTransaction.type === 'income' || newTransaction.type === 'expense' || newTransaction.type === 'loan_payment')) {
            const operation = newTransaction.type === 'income' ? 'add' : 'subtract';
            await cardsService.updateBalance(newTransaction.cardId, newTransaction.amount, operation);
        }
    },

    async delete(id: string): Promise<void> {
        const transaction = await this.getById(id);
        if (transaction) {
            // Revert card balance if it's an income, expense, or loan payment
            if (transaction.cardId && (transaction.type === 'income' || transaction.type === 'expense' || transaction.type === 'loan_payment')) {
                const operation = transaction.type === 'income' ? 'subtract' : 'add';
                await cardsService.updateBalance(transaction.cardId, transaction.amount, operation);
            }
            await db.transactions.delete(id);
        }
    },

    async createLoanPayment(loanId: string, loanPaymentId: string, cardId: string, amount: number, description: string, date: number): Promise<Transaction> {
        const transactionData = {
            type: 'loan_payment' as const,
            amount,
            currency: 'IRR', // Default currency, could be made configurable
            cardId,
            description,
            date,
            source: 'manual' as const,
            loanId,
            loanPaymentId,
        };

        const newTransaction = await this.create(transactionData);

        // Update the loan payment status
        const loan = await db.loans.get(loanId);
        if (loan) {
            const updatedPayments = loan.payments.map((payment: LoanPayment) =>
                payment.id === loanPaymentId
                    ? { ...payment, status: 'paid' as const, paidDate: date }
                    : payment
            );
            await db.loans.update(loanId, { payments: updatedPayments });
        }

        return newTransaction;
    }
};

// Loans Service
export const loansService = {
    async getAll(): Promise<Loan[]> {
        return await db.loans.orderBy('createdAt').reverse().toArray();
    },

    async getById(id: string): Promise<Loan | undefined> {
        return await db.loans.get(id);
    },

    async getActive(): Promise<Loan[]> {
        return await db.loans.where('status').equals('active').toArray();
    },

    async create(loan: Omit<Loan, 'id' | 'payments' | 'createdAt'>): Promise<Loan> {
        const newLoan: Loan = {
            ...loan,
            id: uuidv4(),
            payments: [],
            createdAt: Date.now(),
        };
        await db.loans.add(newLoan);
        return newLoan;
    },

    async update(id: string, updates: Partial<Loan>): Promise<void> {
        await db.loans.update(id, updates);
    },

    async delete(id: string): Promise<void> {
        await db.loans.delete(id);
    },

    async markPaymentPaid(loanId: string, paymentId: string, paidDate: number): Promise<void> {
        const loan = await this.getById(loanId);
        if (loan) {
            const payment = loan.payments.find(p => p.id === paymentId);
            if (payment) {
                payment.status = 'paid';
                payment.paidDate = paidDate;
                await this.update(loanId, { payments: loan.payments });
            }
        }
    },

    async addPayment(loanId: string, payment: Omit<Loan['payments'][0], 'id'>): Promise<void> {
        const loan = await this.getById(loanId);
        if (loan) {
            const newPayment = {
                ...payment,
                id: uuidv4(),
            };
            loan.payments.push(newPayment);
            await this.update(loanId, { payments: loan.payments });
        }
    }
};

// Settings Service
export const settingsService = {
    async get(): Promise<Settings | null> {
        const settings = await db.settings.toCollection().first();
        if (!settings) {
            // Initialize default settings
            const defaultSettings: Settings = {
                id: 'default',
                defaultCurrency: 'IRR',
                currencies: [
                    { code: 'IRR', name: 'Iranian Rial', symbol: 'ریال', exchangeRate: 1 },
                    { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 42000 },
                ],
                lastUpdated: Date.now(),
            };
            await db.settings.add(defaultSettings);
            return defaultSettings;
        }
        return settings;
    },

    async update(updates: Partial<Settings>): Promise<void> {
        await db.settings.update('default', { ...updates, lastUpdated: Date.now() });
    },

    async updateCurrencyRates(rates: { [code: string]: number }): Promise<void> {
        const settings = await this.get();
        if (settings) {
            const updatedCurrencies = settings.currencies.map(currency => ({
                ...currency,
                exchangeRate: rates[currency.code] || currency.exchangeRate,
            }));
            await this.update({ currencies: updatedCurrencies });
        }
    }
};

// Friend Loans Service
export const friendLoansService = {
    async getAll(): Promise<FriendLoan[]> {
        return await db.friendLoans.orderBy('createdAt').reverse().toArray();
    },

    async getById(id: string): Promise<FriendLoan | undefined> {
        return await db.friendLoans.get(id);
    },

    async getActive(): Promise<FriendLoan[]> {
        return await db.friendLoans.where('status').equals('active').toArray();
    },

    async create(friendLoan: Omit<FriendLoan, 'id' | 'createdAt'>): Promise<FriendLoan> {
        const newFriendLoan: FriendLoan = {
            ...friendLoan,
            id: uuidv4(),
            payments: [], // Start with empty payments array
            createdAt: Date.now(),
        };

        // Create transaction for lending money (expense)
        await transactionsService.create({
            type: 'friend_loan_payback',
            amount: friendLoan.amount,
            currency: friendLoan.currency,
            cardId: friendLoan.cardId,
            description: `Lent money to ${friendLoan.friendName}${friendLoan.description ? ` - ${friendLoan.description}` : ''}`,
            date: friendLoan.loanDate,
            source: 'manual',
        });

        await db.friendLoans.add(newFriendLoan);

        // Only create a default payment if no custom payments were provided
        if (!friendLoan.payments || friendLoan.payments.length === 0) {
            const payment: Omit<FriendLoanPayment, 'id'> = {
                amount: friendLoan.amount,
                dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
                status: 'pending',
            };
            await this.addPayment(newFriendLoan.id, payment);
        } else {
            // Add the custom payments with proper IDs
            for (const payment of friendLoan.payments) {
                const paymentWithId: Omit<FriendLoanPayment, 'id'> = {
                    amount: payment.amount,
                    dueDate: payment.dueDate,
                    status: payment.status,
                };
                await this.addPayment(newFriendLoan.id, paymentWithId);
            }
        }

        return newFriendLoan;
    },

    async update(id: string, updates: Partial<FriendLoan>): Promise<void> {
        await db.friendLoans.update(id, updates);
    },

    async delete(id: string): Promise<void> {
        await db.friendLoans.delete(id);
    },

    async addPayment(friendLoanId: string, payment: Omit<FriendLoanPayment, 'id'>): Promise<void> {
        const friendLoan = await this.getById(friendLoanId);
        if (friendLoan) {
            const newPayment = {
                ...payment,
                id: uuidv4(),
            };
            friendLoan.payments.push(newPayment);
            await this.update(friendLoanId, { payments: friendLoan.payments });
        }
    },

    async markPaymentPaid(friendLoanId: string, paymentId: string, paybackCardId: string, paidDate?: number): Promise<void> {
        const friendLoan = await this.getById(friendLoanId);
        if (friendLoan) {
            const payment = friendLoan.payments.find(p => p.id === paymentId);
            if (payment) {
                // Create transaction for receiving payback (not income - recovering lent money)
                await transactionsService.create({
                    type: 'friend_loan_payback',
                    amount: payment.amount,
                    currency: friendLoan.currency,
                    cardId: paybackCardId,
                    description: `Received payback from ${friendLoan.friendName}${friendLoan.description ? ` - ${friendLoan.description}` : ''}`,
                    date: paidDate || Date.now(),
                    source: 'manual',
                });
            }

            const updatedPayments = friendLoan.payments.map(payment => {
                if (payment.id === paymentId) {
                    return {
                        ...payment,
                        status: 'paid' as const,
                        paidDate: paidDate || Date.now(),
                        paybackCardId: paybackCardId,
                    };
                }
                return payment;
            });

            // Check if all payments are now completed and sum equals loan amount
            const allPaymentsCompleted = updatedPayments.every(payment => payment.status === 'paid');
            const paidAmount = updatedPayments
                .filter(payment => payment.status === 'paid')
                .reduce((sum, payment) => sum + payment.amount, 0);
            const loanAmount = friendLoan.amount;

            // Update the loan with new payments and potentially new status
            const updateData: Partial<FriendLoan> = { payments: updatedPayments };
            if (allPaymentsCompleted && Math.abs(paidAmount - loanAmount) < 0.01) {
                updateData.status = 'settled';
            }

            await this.update(friendLoanId, updateData);
        }
    },

    async getTotalLentAmount(): Promise<number> {
        const activeLoans = await this.getActive();
        return activeLoans.reduce((total, loan) => total + loan.amount, 0);
    },

    async getUpcomingPaybacks(daysAhead: number = 30): Promise<FriendLoanPayment[]> {
        const activeLoans = await this.getActive();
        const today = Date.now();
        const futureDate = today + daysAhead * 24 * 60 * 60 * 1000;

        const upcomingPaybacks: FriendLoanPayment[] = [];

        activeLoans.forEach(loan => {
            loan.payments.forEach(payment => {
                if (payment.status === 'pending' &&
                    payment.dueDate >= today &&
                    payment.dueDate <= futureDate) {
                    upcomingPaybacks.push(payment);
                }
            });
        });

        return upcomingPaybacks.sort((a, b) => a.dueDate - b.dueDate);
    }
};

// Export loanCalculator
export { loanCalculator } from './loanCalculator';

// Export backup service
export { backupService } from './backupService';

// Export update service
export { updateService } from './updateService';
