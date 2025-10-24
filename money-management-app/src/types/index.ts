export interface Card {
    id: string;
    name: string;
    balance: number;
    currency: string;
    color: string;
    createdAt: number; // Unix timestamp
}

export interface Category {
    id: string;
    name: string;
    maxBudget?: number;
    color: string;
    icon: string;
    createdAt: number; // Unix timestamp
}

export type TransactionType = 'income' | 'expense' | 'transfer' | 'loan_payment' | 'friend_loan_payback';

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    currency: string;
    categoryIds?: string[]; // Support for multiple categories
    cardId?: string;
    fromCardId?: string;
    toCardId?: string;
    description: string;
    date: number; // Unix timestamp
    source: 'manual' | 'sms';
    smsText?: string;
    loanId?: string; // For loan payment transactions
    loanPaymentId?: string; // Reference to specific loan payment
}

export interface LoanPayment {
    id: string;
    amount: number;
    dueDate: number; // Unix timestamp
    paidDate?: number; // Unix timestamp
    status: 'pending' | 'paid' | 'overdue';
    paymentCardId?: string; // Card used to make the payment
}

export interface Loan {
    id: string;
    name: string;
    principalAmount: number;
    totalPayback: number;
    wageFee: number; // Fee paid to bank/loan provider
    wageFeePaid: boolean; // Whether the wage fee has been paid
    wageFeePaymentCardId?: string; // Card used to pay the wage fee
    startDate: number; // Unix timestamp
    endDate: number; // Unix timestamp
    paymentDay?: number; // Day of month (1-31) - Optional for periodic payments
    interestRate: number; // Annual percentage rate
    payments: LoanPayment[];
    status: 'active' | 'completed' | 'defaulted';
    currency: string;
    createdAt: number; // Unix timestamp
}

export interface Currency {
    code: string;
    name: string;
    symbol: string;
    exchangeRate: number; // Rate to default currency
}

export interface Settings {
    id: string;
    defaultCurrency: string;
    currencies: Currency[];
    lastUpdated: number; // Unix timestamp
}

export interface ParsedSMS {
    amount: number;
    currency: string;
    cardNumber?: string;
    transactionType: 'income' | 'expense';
    balance?: number;
    merchant?: string;
    description: string;
    date: number; // Unix timestamp
}

export interface FriendLoanPayment {
    id: string;
    amount: number;
    dueDate: number; // Unix timestamp
    paidDate?: number; // Unix timestamp
    status: 'pending' | 'paid' | 'overdue';
    paybackCardId?: string; // Card where the money was returned to
}

export interface FriendLoan {
    id: string;
    friendName: string;
    amount: number;
    currency: string;
    cardId: string; // Card used to lend money
    loanDate: number; // Unix timestamp
    description?: string;
    payments: FriendLoanPayment[];
    status: 'active' | 'completed' | 'settled' | 'defaulted';
    createdAt: number; // Unix timestamp
}

export interface DashboardStats {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    budgetUtilization: number;
    upcomingPayments: LoanPayment[];
    recentTransactions: Transaction[];
    totalLentToFriends: number;
    upcomingFriendPaybacks: FriendLoanPayment[];
}
