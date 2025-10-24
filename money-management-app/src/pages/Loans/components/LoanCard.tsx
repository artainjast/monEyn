import React from 'react';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Loan, LoanPayment, Card as CardType } from '../../../types';
import { loanCalculator } from '../../../services';
import { Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface LoanCardProps {
    loan: Loan;
    cards: CardType[];
    onEdit: (loan: Loan) => void;
    onDelete: (loanId: string) => void;
    onMarkPaymentPaid: (loanId: string, paymentId: string) => void;
    onPayWageFee: (loan: Loan) => void;
}

export const LoanCard: React.FC<LoanCardProps> = ({
    loan,
    cards,
    onEdit,
    onDelete,
    onMarkPaymentPaid,
    onPayWageFee,
}) => {
    console.log(loan);
    const summary = loanCalculator.getLoanSummary(loan);

    const getStatusColor = (status: Loan['status']) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'defaulted': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status: LoanPayment['status']) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{loan.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                        {loan.status}
                    </span>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onEdit(loan)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(loan.id)}
                        className="text-gray-400 hover:text-red-600"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Principal Amount</p>
                        <p className="font-semibold text-gray-900">
                            {loan.principalAmount.toLocaleString('fa-IR')} {loan.currency}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Payback</p>
                        <p className="font-semibold text-gray-900">
                            {loan.totalPayback.toLocaleString('fa-IR')} {loan.currency}
                        </p>
                    </div>
                </div>

                {loan.wageFee > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Wage Fee</p>
                            <p className="font-semibold text-gray-900">
                                {loan.wageFee.toLocaleString('fa-IR')} {loan.currency}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Fee Status</p>
                            <div className="flex items-center">
                                {loan.wageFeePaid ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Paid
                                    </span>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => onPayWageFee(loan)}
                                        className="text-xs"
                                    >
                                        Pay Wage Fee
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Remaining Balance</p>
                        <p className="font-semibold text-gray-900">
                            {summary.remainingBalance.toLocaleString('fa-IR')} {loan.currency}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Progress</p>
                        <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                    className="bg-primary-600 h-2 rounded-full"
                                    style={{ width: `${summary.progressPercentage}%` }}
                                />
                            </div>
                            <span className="text-sm text-gray-600">{Math.round(summary.progressPercentage)}%</span>
                        </div>
                    </div>
                </div>

                {summary.nextPayment && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-blue-800">Next Payment</p>
                                <p className="text-sm text-blue-600">
                                    {format(summary.nextPayment.dueDate, 'MMM dd, yyyy')}
                                </p>
                            </div>
                            <div className="flex flex-col sm:items-end gap-2">
                                <p className="font-semibold text-blue-800">
                                    {summary.nextPayment.amount.toLocaleString('fa-IR')} {loan.currency}
                                </p>
                                <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => onMarkPaymentPaid(loan.id, summary.nextPayment!.id)}
                                    className="w-full sm:w-auto"
                                >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Mark Paid
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Schedule */}

                {loan.payments.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Schedule</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {loan.payments.map((payment) => (
                                <div key={payment.id} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center">
                                        <span className="text-gray-700">
                                            {format(payment.dueDate, 'MMM dd, yyyy')}
                                        </span>
                                        {payment.status === 'paid' && (
                                            <CheckCircle className="w-3 h-3 text-green-500 ml-1" />
                                        )}
                                        {payment.status === 'overdue' && (
                                            <AlertCircle className="w-3 h-3 text-red-500 ml-1" />
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`font-medium ${payment.status === 'paid' ? 'text-green-600' :
                                            payment.status === 'overdue' ? 'text-red-600' :
                                                'text-gray-700'
                                            }`}>
                                            {payment.amount.toLocaleString('fa-IR')} {loan.currency}
                                        </span>
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                                            {payment.status}
                                        </span>
                                        {payment.status === 'pending' && (
                                            <button
                                                onClick={() => onMarkPaymentPaid(loan.id, payment.id)}
                                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                                            >
                                                Pay Now
                                            </button>
                                        )}
                                        {payment.status === 'paid' && payment.paymentCardId && (
                                            <span className="text-xs text-gray-500">
                                                via {cards.find(card => card.id === payment.paymentCardId)?.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Payment Progress */}
                        <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>
                                    {loan.payments.filter(p => p.status === 'paid').length} / {loan.payments.length} paid
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${(loan.payments.filter(p => p.status === 'paid').length / loan.payments.length) * 100}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};
