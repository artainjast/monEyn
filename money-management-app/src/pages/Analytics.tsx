import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Select } from '../components/Select';
import { Transaction, Category } from '../types';
import { transactionsService, categoriesService } from '../services';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export const Analytics: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('6');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [transactionsData, categoriesData] = await Promise.all([
                transactionsService.getAll(),
                categoriesService.getAll(),
            ]);

            setTransactions(transactionsData);
            setCategories(categoriesData);
            // Initialize with all categories selected
            setSelectedCategories(categoriesData.map(c => c.id));
        } catch (error) {
            console.error('Error loading analytics data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredTransactions = () => {
        if (selectedCategories.length === 0) return [];
        return transactions.filter(t =>
            !t.categoryIds || t.categoryIds.some(id => selectedCategories.includes(id))
        );
    };

    const getMonthlyData = () => {
        const filteredTransactions = getFilteredTransactions();
        const months = eachMonthOfInterval({
            start: subMonths(new Date(), parseInt(selectedPeriod) - 1),
            end: new Date(),
        });

        return months.map(month => {
            const monthStart = startOfMonth(month);
            const monthEnd = endOfMonth(month);

            const monthTransactions = filteredTransactions.filter(t =>
                t.date >= monthStart.getTime() && t.date <= monthEnd.getTime()
            );

            const income = monthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const expenses = monthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                month: format(month, 'MMM yyyy'),
                income,
                expenses,
                net: income - expenses,
            };
        });
    };

    const getCategoryData = () => {
        const filteredTransactions = getFilteredTransactions();
        const categoryTotals = categories
            .filter(category => selectedCategories.includes(category.id))
            .map(category => {
                const categoryTransactions = filteredTransactions.filter(t =>
                    t.categoryIds?.includes(category.id) && t.type === 'expense'
                );
                const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
                return {
                    name: category.name,
                    total,
                    color: category.color,
                };
            }).filter(item => item.total > 0);

        return categoryTotals;
    };

    const getBudgetUtilizationData = () => {
        const filteredTransactions = getFilteredTransactions();
        const currentMonth = new Date();
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);

        const monthTransactions = filteredTransactions.filter(t =>
            t.date >= monthStart.getTime() && t.date <= monthEnd.getTime() && t.type === 'expense'
        );

        return categories
            .filter(category => selectedCategories.includes(category.id))
            .map(category => {
                const categoryTransactions = monthTransactions.filter(t => t.categoryIds?.includes(category.id));
                const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
                const budget = category.maxBudget || 0;
                const utilization = budget > 0 ? (spent / budget) * 100 : 0;

                return {
                    name: category.name,
                    spent,
                    budget,
                    utilization: Math.min(utilization, 100),
                    color: category.color,
                };
            }).filter(item => item.budget > 0);
    };

    const monthlyData = getMonthlyData();
    const categoryData = getCategoryData();
    const budgetData = getBudgetUtilizationData();

    const incomeExpenseChartData = {
        labels: monthlyData.map(d => d.month),
        datasets: [
            {
                label: 'Income',
                data: monthlyData.map(d => d.income),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.1,
            },
            {
                label: 'Expenses',
                data: monthlyData.map(d => d.expenses),
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.1,
            },
        ],
    };

    const categoryChartData = {
        labels: categoryData.map(d => d.name),
        datasets: [
            {
                data: categoryData.map(d => d.total),
                backgroundColor: categoryData.map(d => d.color),
                borderWidth: 2,
                borderColor: '#fff',
            },
        ],
    };

    const budgetChartData = {
        labels: budgetData.map(d => d.name),
        datasets: [
            {
                label: 'Budget Utilization (%)',
                data: budgetData.map(d => d.utilization),
                backgroundColor: budgetData.map(d => d.color),
                borderWidth: 1,
                borderColor: '#fff',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Financial Overview',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value: any) {
                        return value.toLocaleString() + ' ریال';
                    },
                },
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
        },
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                    <p className="text-gray-600 dark:text-gray-400">Visualize your financial data</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        options={[
                            { value: '1', label: 'Last month' },
                            { value: '3', label: 'Last 3 months' },
                            { value: '6', label: 'Last 6 months' },
                            { value: '12', label: 'Last 12 months' },
                        ]}
                        className="w-full sm:w-auto"
                    />
                </div>
            </div>

            {/* Category Filter */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Categories</h3>
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {categories.map(category => (
                            <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedCategories(prev => [...prev, category.id]);
                                        } else {
                                            setSelectedCategories(prev => prev.filter(id => id !== category.id));
                                        }
                                    }}
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <div className="flex items-center">
                                    <div
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    <span className="text-sm text-gray-700">{category.name}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSelectedCategories(categories.map(c => c.id))}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                            Select All
                        </button>
                        <button
                            onClick={() => setSelectedCategories([])}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
            </Card>

            {/* Income vs Expenses Chart */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Income vs Expenses Trend</h3>
                <div className="h-80">
                    <Line data={incomeExpenseChartData} options={chartOptions} />
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
                    <div className="h-80">
                        <Doughnut data={categoryChartData} options={doughnutOptions} />
                    </div>
                    <div className="mt-4 space-y-2">
                        {categoryData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                    <div
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-gray-700">{item.name}</span>
                                </div>
                                <span className="font-medium text-gray-900">
                                    {item.total.toLocaleString()} ریال
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Budget Utilization */}
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Utilization</h3>
                    <div className="h-80">
                        <Bar data={budgetChartData} options={{
                            ...chartOptions,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    max: 100,
                                    ticks: {
                                        callback: function (value: any) {
                                            return value + '%';
                                        },
                                    },
                                },
                            },
                        }} />
                    </div>
                    <div className="mt-4 space-y-3">
                        {budgetData.map((item, index) => (
                            <div key={index} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-700">{item.name}</span>
                                    <span className="font-medium text-gray-900">
                                        {item.spent.toLocaleString()} / {item.budget.toLocaleString()} ریال
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${item.utilization > 100 ? 'bg-red-500' :
                                            item.utilization > 80 ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}
                                        style={{ width: `${Math.min(item.utilization, 100)}%` }}
                                    />
                                </div>
                                <div className="text-xs text-gray-500 text-right">
                                    {Math.round(item.utilization)}% utilized
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="text-center">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Total Income</h4>
                        <p className="text-2xl font-bold text-green-600">
                            {monthlyData.reduce((sum, d) => sum + d.income, 0).toLocaleString()} ریال
                        </p>
                    </div>
                </Card>

                <Card>
                    <div className="text-center">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Total Expenses</h4>
                        <p className="text-2xl font-bold text-red-600">
                            {monthlyData.reduce((sum, d) => sum + d.expenses, 0).toLocaleString()} ریال
                        </p>
                    </div>
                </Card>

                <Card>
                    <div className="text-center">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Net Savings</h4>
                        <p className={`text-2xl font-bold ${monthlyData.reduce((sum, d) => sum + d.net, 0) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {monthlyData.reduce((sum, d) => sum + d.net, 0).toLocaleString()} ریال
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};
