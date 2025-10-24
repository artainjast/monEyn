import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { DatePicker } from '../components/DatePicker';
import { Modal } from '../components/Modal';
import { MultiCategorySelect } from '../components/MultiCategorySelect';
import { Transaction, Card as CardType, Category, Loan } from '../types';
import { transactionsService, cardsService, categoriesService, loansService } from '../services';
import { smsParser } from '../services/smsParser';
import { Plus, Edit, Trash2, MessageSquare, Filter, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { useAutoAnimate } from '@formkit/auto-animate/react';

export const Transactions: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [cards, setCards] = useState<CardType[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSMSModal, setShowSMSModal] = useState(false);
    const [showLoanPaymentModal, setShowLoanPaymentModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [smsText, setSmsText] = useState('');
    const [parsedSMS, setParsedSMS] = useState<any>(null);

    // AutoAnimate hook for transaction list
    const [animateRef] = useAutoAnimate();

    const [formData, setFormData] = useState({
        type: 'expense' as Transaction['type'],
        amount: '',
        currency: 'IRR',
        categoryIds: [] as string[],
        cardId: '',
        description: '',
        date: Date.now(),
    });

    const [loanPaymentData, setLoanPaymentData] = useState({
        loanId: '',
        paymentId: '',
        cardId: '',
        amount: '',
        description: '',
        date: Date.now(),
    });

    const [filters, setFilters] = useState({
        type: '',
        categoryId: '',
        cardId: '',
        startDate: null as number | null,
        endDate: null as number | null,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [transactionsData, cardsData, categoriesData, loansData] = await Promise.all([
                transactionsService.getAll(),
                cardsService.getAll(),
                categoriesService.getAll(),
                loansService.getAll(),
            ]);

            setTransactions(transactionsData);
            setCards(cardsData);
            setCategories(categoriesData);
            setLoans(loansData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const transactionData = {
                type: formData.type,
                amount: parseFloat(formData.amount),
                currency: formData.currency,
                categoryIds: formData.categoryIds.length > 0 ? formData.categoryIds : undefined,
                cardId: formData.cardId || undefined,
                description: formData.description,
                date: formData.date,
                source: 'manual' as const,
            };

            if (editingTransaction) {
                await transactionsService.update(editingTransaction.id, transactionData);
            } else {
                await transactionsService.create(transactionData);
            }

            setShowAddModal(false);
            setEditingTransaction(null);
            setFormData({
                type: 'expense',
                amount: '',
                currency: 'IRR',
                categoryIds: [],
                cardId: '',
                description: '',
                date: Date.now(),
            });
            loadData();
        } catch (error) {
            console.error('Error saving transaction:', error);
        }
    };

    const handleLoanPaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await transactionsService.createLoanPayment(
                loanPaymentData.loanId,
                loanPaymentData.paymentId,
                loanPaymentData.cardId,
                parseFloat(loanPaymentData.amount),
                loanPaymentData.description,
                loanPaymentData.date
            );

            setShowLoanPaymentModal(false);
            setLoanPaymentData({
                loanId: '',
                paymentId: '',
                cardId: '',
                amount: '',
                description: '',
                date: Date.now(),
            });
            loadData();
        } catch (error) {
            console.error('Error creating loan payment:', error);
        }
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setFormData({
            type: transaction.type,
            amount: transaction.amount.toString(),
            currency: transaction.currency,
            categoryIds: transaction.categoryIds || [],
            cardId: transaction.cardId || '',
            description: transaction.description,
            date: transaction.date,
        });
        setShowAddModal(true);
    };

    const handleDelete = async (transactionId: string) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await transactionsService.delete(transactionId);
                loadData();
            } catch (error) {
                console.error('Error deleting transaction:', error);
            }
        }
    };

    const handleSMSParse = () => {
        if (!smsText.trim()) return;

        const parsed = smsParser.parseSMS(smsText);
        if (parsed) {
            setParsedSMS(parsed);
            setFormData({
                type: parsed.transactionType,
                amount: parsed.amount.toString(),
                currency: parsed.currency,
                categoryIds: [],
                cardId: cards.find(c => c.name.includes(parsed.cardNumber || ''))?.id || '',
                description: parsed.description,
                date: parsed.date,
            });
            setShowSMSModal(false);
            setShowAddModal(true);
        } else {
            alert('Could not parse SMS. Please check the format and try again.');
        }
    };

    const filteredTransactions = transactions.filter(transaction => {
        if (filters.type && transaction.type !== filters.type) return false;
        if (filters.categoryId && !transaction.categoryIds?.includes(filters.categoryId)) return false;
        if (filters.cardId && transaction.cardId !== filters.cardId) return false;
        if (filters.startDate && transaction.date < filters.startDate) return false;
        if (filters.endDate && transaction.date > filters.endDate) return false;
        return true;
    });

    const getCategoryNames = (categoryIds?: string[]) => {
        if (!categoryIds || categoryIds.length === 0) {
            return 'Uncategorized';
        }
        const categoryNames = categoryIds
            .map(id => categories.find(c => c.id === id)?.name)
            .filter(Boolean);
        return categoryNames.length > 0 ? categoryNames.join(', ') : 'Uncategorized';
    };

    const getCardName = (cardId?: string) => {
        const card = cards.find(c => c.id === cardId);
        return card?.name || 'Unknown Card';
    };

    const getLoanName = (loanId?: string) => {
        const loan = loans.find(l => l.id === loanId);
        return loan?.name || 'Unknown Loan';
    };

    const getSelectedLoan = () => {
        return loans.find(l => l.id === loanPaymentData.loanId);
    };

    const getPendingPayments = () => {
        const loan = getSelectedLoan();
        return loan ? loan.payments.filter(p => p.status === 'pending') : [];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }


    console.log(filteredTransactions);
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
                    <p className="text-gray-600 dark:text-gray-400">Track your income and expenses</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button variant="secondary" onClick={() => setShowSMSModal(true)} className="w-full sm:w-auto">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Parse SMS
                    </Button>
                    <Button variant="secondary" onClick={() => setShowLoanPaymentModal(true)} className="w-full sm:w-auto">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Loan Payment
                    </Button>
                    <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Transaction
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <div className="space-y-4">
                    <div className="flex items-center">
                        <Filter className="w-5 h-5 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Filters</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        <Select
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            options={[
                                { value: '', label: 'All Types' },
                                { value: 'income', label: 'Income' },
                                { value: 'expense', label: 'Expense' },
                                { value: 'transfer', label: 'Transfer' },
                                { value: 'loan_payment', label: 'Loan Payment' },
                            ]}
                        />
                        <Select
                            value={filters.categoryId}
                            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                            options={[
                                { value: '', label: 'All Categories' },
                                ...categories.map(cat => ({ value: cat.id, label: cat.name })),
                            ]}
                        />
                        <Select
                            value={filters.cardId}
                            onChange={(e) => setFilters({ ...filters, cardId: e.target.value })}
                            options={[
                                { value: '', label: 'All Cards' },
                                ...cards.map(card => ({ value: card.id, label: card.name })),
                            ]}
                        />
                        <DatePicker
                            label="Start Date"
                            value={filters.startDate}
                            onChange={(date) => setFilters({ ...filters, startDate: date })}
                        />
                        <DatePicker
                            label="End Date"
                            value={filters.endDate}
                            onChange={(date) => setFilters({ ...filters, endDate: date })}
                        />
                    </div>
                </div>
            </Card>

            {/* Transactions List */}
            <Card>
                <div className="space-y-4" ref={animateRef}>

                    {filteredTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-gray-100 last:border-b-0 gap-3">
                            <div className="flex items-center min-w-0 flex-1">
                                <div className={`w-3 h-3 rounded-full mr-4 flex-shrink-0 ${transaction.type === 'income' ? 'bg-green-500' :
                                    transaction.type === 'expense' ? 'bg-red-500' :
                                        transaction.type === 'loan_payment' ? 'bg-purple-500' : 'bg-blue-500'
                                    }`} />
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white truncate">{transaction.description}</p>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                        <span>{getCategoryNames(transaction.categoryIds)}</span>
                                        <span className="hidden sm:inline">•</span>
                                        <span>{getCardName(transaction.cardId)}</span>
                                        <span className="hidden sm:inline">•</span>

                                        <span>{format(new Date(transaction.date), 'MMM dd, yyyy')}</span>
                                        {transaction.source === 'sms' && (
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                                SMS
                                            </span>
                                        )}
                                        {transaction.type === 'loan_payment' && transaction.loanId && (
                                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                                                {getLoanName(transaction.loanId)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-3">
                                <div className="text-right">
                                    <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' :
                                        transaction.type === 'expense' ? 'text-red-600' :
                                            transaction.type === 'loan_payment' ? 'text-purple-600' : 'text-blue-600'
                                        }`}>
                                        {transaction.type === 'income' ? '+' :
                                            transaction.type === 'expense' ? '-' :
                                                transaction.type === 'loan_payment' ? '💳' : '↔'}{transaction.amount.toLocaleString()} {transaction.currency}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(transaction)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(transaction.id)}
                                        className="text-gray-400 hover:text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {filteredTransactions.length === 0 && (
                <div className="text-center py-12 flex flex-col items-center justify-center ">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No transactions found</h2>
                    <p className="text-gray-600 mb-8">Add your first transaction or adjust your filters.</p>
                    <Button onClick={() => setShowAddModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Transaction
                    </Button>
                </div>
            )}

            {/* Add/Edit Transaction Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setEditingTransaction(null);
                    setFormData({
                        type: 'expense',
                        amount: '',
                        currency: 'IRR',
                        categoryIds: [],
                        cardId: '',
                        description: '',
                        date: Date.now(),
                    });
                }}
                title={editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select
                            label="Type"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as Transaction['type'] })}
                            options={[
                                { value: 'income', label: 'Income' },
                                { value: 'expense', label: 'Expense' },
                                { value: 'transfer', label: 'Transfer' },
                            ]}
                            required
                        />

                        <Input
                            label="Amount"
                            type="number"
                            formatNumber={true}
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select
                            label="Currency"
                            value={formData.currency}
                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                            options={[
                                { value: 'IRR', label: 'Iranian Rial (ریال)' },
                                { value: 'USD', label: 'US Dollar ($)' },
                            ]}
                        />

                        <Select
                            label="Card"
                            value={formData.cardId}
                            onChange={(e) => setFormData({ ...formData, cardId: e.target.value })}
                            options={[
                                { value: '', label: 'Select Card' },
                                ...cards.map(card => ({ value: card.id, label: card.name })),
                            ]}
                        />
                    </div>

                    <MultiCategorySelect
                        label="Categories"
                        categories={categories}
                        selectedCategoryIds={formData.categoryIds}
                        onChange={(categoryIds) => setFormData({ ...formData, categoryIds })}
                        placeholder="Select categories"
                    />

                    <Input
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />

                    <DatePicker
                        label="Date"
                        value={formData.date}
                        onChange={(date) => setFormData({ ...formData, date: date || Date.now() })}
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setShowAddModal(false);
                                setEditingTransaction(null);
                                setFormData({
                                    type: 'expense',
                                    amount: '',
                                    currency: 'IRR',
                                    categoryIds: [],
                                    cardId: '',
                                    description: '',
                                    date: Date.now(),
                                });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* SMS Parser Modal */}
            <Modal
                isOpen={showSMSModal}
                onClose={() => {
                    setShowSMSModal(false);
                    setSmsText('');
                    setParsedSMS(null);
                }}
                title="Parse Bank SMS"
                size="lg"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            SMS Text
                        </label>
                        <textarea
                            value={smsText}
                            onChange={(e) => setSmsText(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            rows={6}
                            placeholder="Paste your bank SMS here..."
                        />
                    </div>

                    {parsedSMS && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-medium text-green-800 mb-2">Parsed Data:</h4>
                            <div className="space-y-1 text-sm text-green-700">
                                <p>Amount: {parsedSMS.amount.toLocaleString()} {parsedSMS.currency}</p>
                                <p>Type: {parsedSMS.transactionType}</p>
                                <p>Description: {parsedSMS.description}</p>
                                {parsedSMS.cardNumber && <p>Card: ****{parsedSMS.cardNumber}</p>}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setShowSMSModal(false);
                                setSmsText('');
                                setParsedSMS(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSMSParse} disabled={!smsText.trim()}>
                            Parse SMS
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Loan Payment Modal */}
            <Modal
                isOpen={showLoanPaymentModal}
                onClose={() => {
                    setShowLoanPaymentModal(false);
                    setLoanPaymentData({
                        loanId: '',
                        paymentId: '',
                        cardId: '',
                        amount: '',
                        description: '',
                        date: Date.now(),
                    });
                }}
                title="Record Loan Payment"
                size="lg"
            >
                <form onSubmit={handleLoanPaymentSubmit} className="space-y-4">
                    <Select
                        label="Select Loan"
                        value={loanPaymentData.loanId}
                        onChange={(e) => {
                            const loanId = e.target.value;
                            setLoanPaymentData({ ...loanPaymentData, loanId, paymentId: '' });
                        }}
                        options={[
                            { value: '', label: 'Select Loan' },
                            ...loans.filter(loan => loan.status === 'active').map(loan => ({
                                value: loan.id,
                                label: `${loan.name} - ${loan.currency}`
                            })),
                        ]}
                        required
                    />

                    {loanPaymentData.loanId && (
                        <Select
                            label="Select Payment"
                            value={loanPaymentData.paymentId}
                            onChange={(e) => {
                                const paymentId = e.target.value;
                                const payment = getPendingPayments().find(p => p.id === paymentId);
                                setLoanPaymentData({
                                    ...loanPaymentData,
                                    paymentId,
                                    amount: payment ? payment.amount.toString() : '',
                                    description: payment ? `Payment for ${getSelectedLoan()?.name}` : ''
                                });
                            }}
                            options={[
                                { value: '', label: 'Select Payment' },
                                ...getPendingPayments().map(payment => ({
                                    value: payment.id,
                                    label: `${format(payment.dueDate, 'MMM dd, yyyy')} - ${payment.amount.toLocaleString()} IRR`
                                })),
                            ]}
                            required
                        />
                    )}

                    <Select
                        label="Payment Card"
                        value={loanPaymentData.cardId}
                        onChange={(e) => setLoanPaymentData({ ...loanPaymentData, cardId: e.target.value })}
                        options={[
                            { value: '', label: 'Select Card' },
                            ...cards.map(card => ({ value: card.id, label: card.name })),
                        ]}
                        required
                    />

                    <Input
                        label="Amount"
                        type="number"
                        formatNumber={true}
                        value={loanPaymentData.amount}
                        onChange={(e) => setLoanPaymentData({ ...loanPaymentData, amount: e.target.value })}
                        required
                    />

                    <Input
                        label="Description"
                        value={loanPaymentData.description}
                        onChange={(e) => setLoanPaymentData({ ...loanPaymentData, description: e.target.value })}
                        required
                    />

                    <DatePicker
                        label="Payment Date"
                        value={loanPaymentData.date}
                        onChange={(date) => setLoanPaymentData({ ...loanPaymentData, date: date || Date.now() })}
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setShowLoanPaymentModal(false);
                                setLoanPaymentData({
                                    loanId: '',
                                    paymentId: '',
                                    cardId: '',
                                    amount: '',
                                    description: '',
                                    date: Date.now(),
                                });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!loanPaymentData.loanId || !loanPaymentData.paymentId || !loanPaymentData.cardId}>
                            Record Payment
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
