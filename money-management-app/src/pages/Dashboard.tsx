import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { DashboardStats } from '../types';
import { cardsService, transactionsService, loansService, friendLoansService, settingsService } from '../services';
import { format } from 'date-fns';
import { Plus, TrendingUp, TrendingDown, AlertCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Load cards and calculate total balance
            const cards = await cardsService.getAll();
            const settings = await settingsService.get();

            const totalBalance = cards.reduce((sum, card) => {
                // Convert to default currency if needed
                const rate = settings?.currencies.find(c => c.code === card.currency)?.exchangeRate || 1;
                return sum + (card.balance * rate);
            }, 0);

            // Load recent transactions
            const transactions = await transactionsService.getAll();
            const recentTransactions = transactions.slice(0, 5);

            // Calculate monthly income and expenses
            const currentMonth = new Date();
            const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

            const monthlyTransactions = transactions.filter(t =>
                t.date >= startOfMonth.getTime() && t.date <= endOfMonth.getTime()
            );

            const monthlyIncome = monthlyTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const monthlyExpenses = monthlyTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            // Load upcoming loan payments
            const loans = await loansService.getActive();
            const upcomingPayments = loans
                .flatMap(loan => loan.payments.filter(p => p.status === 'pending'))
                .sort((a, b) => a.dueDate - b.dueDate)
                .slice(0, 3);

            // Load friend loan statistics
            const totalLentToFriends = await friendLoansService.getTotalLentAmount();
            const upcomingFriendPaybacks = await friendLoansService.getUpcomingPaybacks(30);

            // Calculate budget utilization (simplified)
            const budgetUtilization = monthlyExpenses > 0 ? (monthlyExpenses / (monthlyIncome || 1)) * 100 : 0;

            setStats({
                totalBalance,
                monthlyIncome,
                monthlyExpenses,
                budgetUtilization,
                upcomingPayments,
                recentTransactions,
                totalLentToFriends,
                upcomingFriendPaybacks,
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Money Manager</h2>
                <p className="text-gray-600 mb-8">Get started by adding your first card and category.</p>
                <div className="space-x-4">
                    <Button onClick={() => navigate('/cards')}>Add Card</Button>
                    <Button onClick={() => navigate('/categories')}>Add Category</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Overview of your finances</p>
                </div>
                <Button onClick={() => navigate('/transactions')} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Transaction
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                            </div>
                        </div>
                        <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Balance</p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate">
                                {stats.totalBalance.toLocaleString('fa-IR')} ریال
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>
                        <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Monthly Income</p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate">
                                {stats.monthlyIncome.toLocaleString('fa-IR')} ریال
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <TrendingDown className="w-4 h-4 text-red-600" />
                            </div>
                        </div>
                        <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Monthly Expenses</p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate">
                                {stats.monthlyExpenses.toLocaleString('fa-IR')} ریال
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-4 h-4 text-yellow-600" />
                            </div>
                        </div>
                        <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Budget Utilization</p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate">
                                {Math.round(stats.budgetUtilization)}%
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-purple-600" />
                            </div>
                        </div>
                        <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Lent to Friends</p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate">
                                {stats.totalLentToFriends.toLocaleString('fa-IR')} ریال
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {/* Recent Transactions */}
                <Card>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                        <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
                        <Button variant="secondary" size="sm" className="w-full sm:w-auto">View All</Button>
                    </div>
                    <div className="space-y-3">
                        {stats.recentTransactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                <div className="flex items-center min-w-0 flex-1">
                                    <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${(transaction.type === 'income' || transaction.type === 'friend_loan_payback') ? 'bg-green-500' :
                                        transaction.type === 'loan_payment' ? 'bg-purple-500' : 'bg-red-500'
                                        }`} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">{transaction.description}</p>
                                        <p className="text-xs text-gray-500">{format(new Date(transaction.date), 'MMM dd, yyyy')}</p>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-2">
                                    <p className={`text-sm font-medium ${transaction.type === 'income' || transaction.type === 'friend_loan_payback' ? 'text-green-600' :
                                        transaction.type === 'loan_payment' ? 'text-purple-600' : 'text-red-600'
                                        }`}>
                                        {transaction.type === 'income' || transaction.type === 'friend_loan_payback' ? '+' :
                                            transaction.type === 'loan_payment' ? '💳' : '-'}{transaction.amount.toLocaleString('fa-IR')} ریال
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Upcoming Payments */}
                <Card>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                        <h3 className="text-lg font-medium text-gray-900">Upcoming Payments</h3>
                        <Button variant="secondary" size="sm" className="w-full sm:w-auto">View All</Button>
                    </div>
                    <div className="space-y-3">
                        {stats.upcomingPayments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900">Loan Payment</p>
                                    <p className="text-xs text-gray-500">{format(payment.dueDate, 'MMM dd, yyyy')}</p>
                                </div>
                                <div className="text-right flex-shrink-0 ml-2">
                                    <p className="text-sm font-medium text-gray-900">
                                        {payment.amount.toLocaleString('fa-IR')} ریال
                                    </p>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${payment.status === 'overdue'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {payment.status === 'overdue' ? 'Overdue' : 'Pending'}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {stats.upcomingPayments.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No upcoming payments</p>
                        )}
                    </div>
                </Card>
            </div>

            {/* Friend Loans Section */}
            {stats.upcomingFriendPaybacks.length > 0 && (
                <Card>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                        <h3 className="text-lg font-medium text-gray-900">Upcoming Friend Paybacks</h3>
                        <Button variant="secondary" size="sm" className="w-full sm:w-auto">View All</Button>
                    </div>
                    <div className="space-y-3">
                        {stats.upcomingFriendPaybacks.slice(0, 5).map((payback) => (
                            <div key={payback.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                <div className="flex items-center min-w-0 flex-1">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                        <Users className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900">Friend Payback</p>
                                        <p className="text-xs text-gray-500">{format(payback.dueDate, 'MMM dd, yyyy')}</p>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-2">
                                    <p className="text-sm font-medium text-gray-900">
                                        {payback.amount.toLocaleString('fa-IR')} ریال
                                    </p>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${payback.status === 'overdue'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-green-100 text-green-800'
                                        }`}>
                                        {payback.status === 'overdue' ? 'Overdue' : 'Expected'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};
