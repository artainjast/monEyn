import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { DatePicker } from './DatePicker';
import { PaymentCalendar } from './PaymentCalendar';
import { Loan } from '../types';
import { loanCalculator } from '../services';
import { Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface LoanFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (loanData: any) => Promise<void>;
    editingLoan?: Loan | null;
    onSetPaymentSchedule?: (schedule: { date: Date; amount: number }[]) => void;
}

export const LoanForm: React.FC<LoanFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    editingLoan,
    onSetPaymentSchedule,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        principalAmount: '',
        totalPayback: '',
        wageFee: '',
        startDate: new Date(),
        interestRate: '',
        currency: 'IRR',
    });

    const [calculationMode, setCalculationMode] = useState<'interest' | 'total'>('interest');
    const [periodicConfig, setPeriodicConfig] = useState({
        dayOfMonth: 1,
        numberOfMonths: 6,
        amountPerPayment: 0
    });

    const [showPaymentScheduleModal, setShowPaymentScheduleModal] = useState(false);
    const [paymentSchedule, setPaymentSchedule] = useState<{ date: number; amount: number }[]>([]);
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');

    // Initialize form data when editing
    useEffect(() => {
        if (editingLoan) {
            setFormData({
                name: editingLoan.name,
                principalAmount: editingLoan.principalAmount.toString(),
                totalPayback: editingLoan.totalPayback.toString(),
                wageFee: editingLoan.wageFee.toString(),
                startDate: new Date(editingLoan.startDate),
                interestRate: editingLoan.interestRate.toString(),
                currency: editingLoan.currency,
            });
            setCalculationMode('interest');
        } else {
            setFormData({
                name: '',
                principalAmount: '',
                totalPayback: '',
                wageFee: '',
                startDate: new Date(),
                interestRate: '',
                currency: 'IRR',
            });
            setCalculationMode('interest');
        }
    }, [editingLoan]);

    // Trigger calculation when calculation mode changes
    useEffect(() => {
        if (calculationMode === 'interest') {
            calculateTotalPayback();
        } else if (calculationMode === 'total') {
            calculateInterestRate();
        }
    }, [calculationMode]);

    // Trigger calculation when number of months changes
    useEffect(() => {
        if (periodicConfig.numberOfMonths > 0) {
            if (calculationMode === 'interest') {
                calculateTotalPayback();
            } else if (calculationMode === 'total') {
                calculateInterestRate();
            }
        }
    }, [periodicConfig.numberOfMonths]);

    const calculateTotalPayback = () => {
        const principalAmount = parseFloat(formData.principalAmount);
        const interestRate = parseFloat(formData.interestRate);

        if (principalAmount && interestRate && formData.startDate && periodicConfig.numberOfMonths > 0) {
            const months = periodicConfig.numberOfMonths;
            const endDate = new Date(formData.startDate);
            endDate.setMonth(endDate.getMonth() + months);

            const totalPayback = loanCalculator.calculateFromInterestRate(
                principalAmount,
                interestRate,
                formData.startDate.getTime(),
                endDate.getTime()
            );
            setFormData(prev => ({ ...prev, totalPayback: totalPayback.toString() }));
        }
    };

    const calculateInterestRate = () => {
        const principalAmount = parseFloat(formData.principalAmount);
        const totalPayback = parseFloat(formData.totalPayback);

        if (principalAmount && totalPayback && formData.startDate && periodicConfig.numberOfMonths > 0) {
            if (principalAmount === totalPayback) {
                setFormData(prev => ({ ...prev, interestRate: '0' }));
                return;
            }

            const months = periodicConfig.numberOfMonths;
            const endDate = new Date(formData.startDate);
            endDate.setMonth(endDate.getMonth() + months);

            const interestRate = loanCalculator.calculateFromTotalPayback(
                principalAmount,
                totalPayback,
                formData.startDate.getTime(),
                endDate.getTime()
            );

            if (isNaN(interestRate) || !isFinite(interestRate)) {
                setFormData(prev => ({ ...prev, interestRate: '0' }));
            } else {
                setFormData(prev => ({ ...prev, interestRate: interestRate.toString() }));
            }
        }
    };

    const handleFormDataChange = (field: string, value: string | number | Date) => {
        const newFormData = { ...formData, [field]: value };
        setFormData(newFormData);

        setTimeout(() => {
            if (calculationMode === 'interest') {
                if (field === 'principalAmount' || field === 'interestRate' || field === 'startDate') {
                    const principalAmount = parseFloat(newFormData.principalAmount);
                    const interestRate = parseFloat(newFormData.interestRate);

                    if (principalAmount && interestRate && newFormData.startDate && periodicConfig.numberOfMonths > 0) {
                        const months = periodicConfig.numberOfMonths;
                        const endDate = new Date(newFormData.startDate);
                        endDate.setMonth(endDate.getMonth() + months);

                        const totalPayback = loanCalculator.calculateFromInterestRate(
                            principalAmount,
                            interestRate,
                            newFormData.startDate.getTime(),
                            endDate.getTime()
                        );
                        setFormData(prev => ({ ...prev, totalPayback: totalPayback.toString() }));
                    }
                }
            } else if (calculationMode === 'total') {
                if (field === 'principalAmount' || field === 'totalPayback' || field === 'startDate') {
                    const principalAmount = parseFloat(newFormData.principalAmount);
                    const totalPayback = parseFloat(newFormData.totalPayback);

                    if (principalAmount && totalPayback && newFormData.startDate && periodicConfig.numberOfMonths > 0) {
                        const months = periodicConfig.numberOfMonths;
                        const endDate = new Date(newFormData.startDate);
                        endDate.setMonth(endDate.getMonth() + months);

                        const interestRate = loanCalculator.calculateFromTotalPayback(
                            principalAmount,
                            totalPayback,
                            newFormData.startDate.getTime(),
                            endDate.getTime()
                        );
                        setFormData(prev => ({ ...prev, interestRate: interestRate.toString() }));
                    }
                }
            }
        }, 100);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let finalFormData = { ...formData };

            if (calculationMode === 'interest') {
                const principalAmount = parseFloat(formData.principalAmount);
                const interestRate = parseFloat(formData.interestRate);

                if (principalAmount && interestRate && formData.startDate) {
                    const months = periodicConfig.numberOfMonths || 6;
                    const endDate = new Date(formData.startDate);
                    endDate.setMonth(endDate.getMonth() + months);

                    const totalPayback = loanCalculator.calculateFromInterestRate(
                        principalAmount,
                        interestRate,
                        formData.startDate.getTime(),
                        endDate.getTime()
                    );
                    finalFormData.totalPayback = totalPayback.toString();
                }
            } else if (calculationMode === 'total') {
                const principalAmount = parseFloat(formData.principalAmount);
                const totalPayback = parseFloat(formData.totalPayback);

                if (principalAmount && totalPayback && formData.startDate) {
                    if (principalAmount === totalPayback) {
                        finalFormData.interestRate = '0';
                    } else {
                        const months = periodicConfig.numberOfMonths || 6;
                        const endDate = new Date(formData.startDate);
                        endDate.setMonth(endDate.getMonth() + months);

                        const interestRate = loanCalculator.calculateFromTotalPayback(
                            principalAmount,
                            totalPayback,
                            formData.startDate.getTime(),
                            endDate.getTime()
                        );

                        if (isNaN(interestRate) || !isFinite(interestRate)) {
                            finalFormData.interestRate = '0';
                        } else {
                            finalFormData.interestRate = interestRate.toString();
                        }
                    }
                }
            }

            const months = periodicConfig.numberOfMonths || 6;
            const endDate = new Date(finalFormData.startDate);
            endDate.setMonth(endDate.getMonth() + months);

            const loanData = {
                name: finalFormData.name,
                principalAmount: parseFloat(finalFormData.principalAmount),
                totalPayback: parseFloat(finalFormData.totalPayback),
                wageFee: parseFloat(finalFormData.wageFee || '0'),
                wageFeePaid: false,
                startDate: finalFormData.startDate,
                endDate: endDate,
                interestRate: parseFloat(finalFormData.interestRate),
                currency: finalFormData.currency,
                status: 'active' as const,
                createdAt: new Date(),
                periodicConfig,
                paymentSchedule,
            };

            await onSubmit(loanData);
            handleClose();
        } catch (error) {
            console.error('Error saving loan:', error);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            principalAmount: '',
            totalPayback: '',
            wageFee: '',
            startDate: new Date(),
            interestRate: '',
            currency: 'IRR',
        });
        setPeriodicConfig({
            dayOfMonth: 1,
            numberOfMonths: 6,
            amountPerPayment: 0
        });
        setPaymentSchedule([]);
        setCalculationMode('interest');
        onClose();
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                title={editingLoan ? 'Edit Loan' : 'Add New Loan'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Loan Name"
                        value={formData.name}
                        onChange={(e) => handleFormDataChange('name', e.target.value)}
                        required
                    />

                    {/* Calculation Mode Toggle */}
                    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Calculation Mode:</span>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => setCalculationMode('interest')}
                                className={`px-3 py-1 rounded-md text-sm font-medium ${calculationMode === 'interest'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300'
                                    }`}
                            >
                                Calculate Total from Interest Rate
                            </button>
                            <button
                                type="button"
                                onClick={() => setCalculationMode('total')}
                                className={`px-3 py-1 rounded-md text-sm font-medium ${calculationMode === 'total'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300'
                                    }`}
                            >
                                Calculate Interest from Total
                            </button>
                        </div>
                    </div>

                    {/* Calculation Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            <strong>How it works:</strong> {
                                calculationMode === 'interest'
                                    ? 'Enter the principal amount, interest rate, and loan period. The total payback amount will be calculated automatically using simple interest formula.'
                                    : 'Enter the principal amount, total payback amount, and loan period. The interest rate will be calculated automatically.'
                            }
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Principal Amount"
                            type="number"
                            formatNumber={true}
                            value={formData.principalAmount}
                            onChange={(e) => handleFormDataChange('principalAmount', e.target.value)}
                            required
                        />

                        <Input
                            label={calculationMode === 'interest' ? 'Total Payback Amount (Auto-calculated)' : 'Total Payback Amount'}
                            type="number"
                            formatNumber={true}
                            value={formData.totalPayback}
                            onChange={(e) => handleFormDataChange('totalPayback', e.target.value)}
                            required
                            disabled={calculationMode === 'interest'}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <Input
                            label="Wage Fee (Optional)"
                            type="number"
                            formatNumber={true}
                            value={formData.wageFee}
                            onChange={(e) => handleFormDataChange('wageFee', e.target.value)}
                            placeholder="Fee paid to bank/loan provider"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <DatePicker
                            label="Start Date"
                            value={formData.startDate.getTime()}
                            onChange={(timestamp) => handleFormDataChange('startDate', timestamp ? new Date(timestamp) : new Date())}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <Input
                            label={calculationMode === 'total' ? 'Interest Rate (%) (Auto-calculated)' : 'Interest Rate (%)'}
                            type="number"
                            step="0.01"
                            formatNumber={true}
                            value={formData.interestRate}
                            onChange={(e) => handleFormDataChange('interestRate', e.target.value)}
                            required
                            disabled={calculationMode === 'total'}
                        />
                    </div>

                    <Select
                        label="Currency"
                        value={formData.currency}
                        onChange={(e) => handleFormDataChange('currency', e.target.value)}
                        options={[
                            { value: 'IRR', label: 'Iranian Rial (ریال)' },
                            { value: 'USD', label: 'US Dollar ($)' },
                        ]}
                    />

                    <div className="border-t pt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Schedule Configuration</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Day of Month
                                </label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={periodicConfig.dayOfMonth}
                                    onChange={(e) => setPeriodicConfig(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) }))}
                                    placeholder="1-31"
                                />
                                <p className="text-xs text-gray-500 mt-1">Which day of each month to pay</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Number of Months
                                </label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={periodicConfig.numberOfMonths}
                                    onChange={(e) => setPeriodicConfig(prev => ({ ...prev, numberOfMonths: parseInt(e.target.value) }))}
                                    placeholder="6"
                                />
                                <p className="text-xs text-gray-500 mt-1">How many months to pay over</p>
                            </div>
                        </div>

                        {formData.totalPayback && periodicConfig.numberOfMonths > 0 && (
                            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                                <h4 className="font-medium text-green-800 mb-2">Payment Preview</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Amount per payment:</span>
                                        <span className="font-semibold">
                                            {(parseFloat(formData.totalPayback || '0') / periodicConfig.numberOfMonths).toLocaleString()} {formData.currency}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Total payments:</span>
                                        <span className="font-semibold">{periodicConfig.numberOfMonths}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Payment frequency:</span>
                                        <span className="font-semibold">Monthly on {periodicConfig.dayOfMonth}{periodicConfig.dayOfMonth === 1 ? 'st' : periodicConfig.dayOfMonth === 2 ? 'nd' : periodicConfig.dayOfMonth === 3 ? 'rd' : 'th'} day</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-700">
                                Payment Schedule (Optional)
                            </label>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setPaymentSchedule([]);
                                    setShowPaymentScheduleModal(true);
                                }}
                            >
                                <Calendar className="w-4 h-4 mr-1" />
                                Set Payment Schedule
                            </Button>
                        </div>
                        {paymentSchedule.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-600 mb-2">
                                    {paymentSchedule.length} payment(s) scheduled:
                                </p>
                                <div className="space-y-1">
                                    {paymentSchedule.map((payment, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <span>{format(payment.date, 'MMM dd, yyyy')}</span>
                                            <span className="font-medium">
                                                {payment.amount.toLocaleString()} {formData.currency}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                    <div className="flex justify-between text-sm">
                                        <span>Total:</span>
                                        <span className="font-semibold">
                                            {paymentSchedule.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString()} {formData.currency}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Total Payback:</span>
                                        <span className="font-semibold">
                                            {parseFloat(formData.totalPayback || '0').toLocaleString()} {formData.currency}
                                        </span>
                                    </div>
                                    <div className={`text-xs font-medium mt-1 ${Math.abs(paymentSchedule.reduce((sum, payment) => sum + payment.amount, 0) - parseFloat(formData.totalPayback || '0')) < 0.01
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                        }`}>
                                        {Math.abs(paymentSchedule.reduce((sum, payment) => sum + payment.amount, 0) - parseFloat(formData.totalPayback || '0')) < 0.01
                                            ? '✅ Payment schedule matches total payback'
                                            : `❌ Payment total must equal total payback amount`
                                        }
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingLoan ? 'Update Loan' : 'Add Loan'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Payment Schedule Modal */}
            <Modal
                isOpen={showPaymentScheduleModal}
                onClose={() => {
                    setShowPaymentScheduleModal(false);
                    setSelectedDate(null);
                    setPaymentAmount('');
                }}
                title={editingLoan ? `Set Payment Schedule for ${editingLoan.name}` : "Set Payment Schedule"}
                size="lg"
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                            <div>
                                <h3 className="text-lg font-semibold text-blue-800">
                                    Create Payment Schedule
                                </h3>
                                <p className="text-blue-700">
                                    Click on dates to set when payments should be made. {editingLoan ? `Total payback amount: ${editingLoan.totalPayback.toLocaleString()} ${editingLoan.currency}` : `Total payback amount: ${formData.totalPayback ? parseFloat(formData.totalPayback).toLocaleString() : '0'} ${formData.currency}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    <PaymentCalendar
                        paymentSchedule={paymentSchedule}
                        onDateClick={(timestamp) => {
                            setSelectedDate(timestamp);
                            setPaymentAmount('');
                        }}
                        selectedDate={selectedDate}
                    />

                    {selectedDate && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3">
                                Set Payment Amount for {format(new Date(selectedDate), 'MMM dd, yyyy')}
                            </h4>
                            <div className="flex space-x-3">
                                <Input
                                    label="Amount"
                                    type="number"
                                    formatNumber={true}
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="flex-1"
                                />
                                <Button
                                    onClick={() => {
                                        if (paymentAmount && parseFloat(paymentAmount) > 0) {
                                            const newPayment = {
                                                date: selectedDate,
                                                amount: parseFloat(paymentAmount)
                                            };
                                            setPaymentSchedule(prev => [...prev, newPayment].sort((a, b) => a.date - b.date));
                                            setSelectedDate(null);
                                            setPaymentAmount('');
                                        }
                                    }}
                                    disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                                >
                                    Add Payment
                                </Button>
                            </div>
                        </div>
                    )}

                    {paymentSchedule.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-medium text-green-800 mb-2">Payment Schedule Summary</h4>
                            <div className="space-y-2">
                                {paymentSchedule.map((payment, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <span className="text-green-700">
                                            {format(new Date(payment.date), 'MMM dd, yyyy')}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium text-green-800">
                                                {payment.amount.toLocaleString()} {formData.currency}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setPaymentSchedule(prev => prev.filter((_, i) => i !== index));
                                                }}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="border-t border-green-200 pt-2 mt-2">
                                    <div className="flex justify-between font-semibold text-green-800">
                                        <span>Total Scheduled:</span>
                                        <span>
                                            {paymentSchedule.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString()} {editingLoan ? editingLoan.currency : formData.currency}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-1">
                                        <span>Total Payback:</span>
                                        <span>
                                            {(editingLoan ? editingLoan.totalPayback : parseFloat(formData.totalPayback || '0')).toLocaleString()} {editingLoan ? editingLoan.currency : formData.currency}
                                        </span>
                                    </div>
                                    {paymentSchedule.length > 0 && (
                                        <div className={`text-sm font-medium mt-2 ${Math.abs(paymentSchedule.reduce((sum, payment) => sum + payment.amount, 0) - (editingLoan ? editingLoan.totalPayback : parseFloat(formData.totalPayback || '0'))) < 0.01
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                            }`}>
                                            {Math.abs(paymentSchedule.reduce((sum, payment) => sum + payment.amount, 0) - (editingLoan ? editingLoan.totalPayback : parseFloat(formData.totalPayback || '0'))) < 0.01
                                                ? '✅ Payment schedule matches total payback amount'
                                                : `❌ Payment total must equal total payback amount (difference: ${Math.abs(paymentSchedule.reduce((sum, payment) => sum + payment.amount, 0) - (editingLoan ? editingLoan.totalPayback : parseFloat(formData.totalPayback || '0'))).toLocaleString()} ${editingLoan ? editingLoan.currency : formData.currency})`
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setShowPaymentScheduleModal(false);
                                setSelectedDate(null);
                                setPaymentAmount('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (onSetPaymentSchedule) {
                                    onSetPaymentSchedule(paymentSchedule.map(p => ({ date: new Date(p.date), amount: p.amount })));
                                }
                                setShowPaymentScheduleModal(false);
                                setSelectedDate(null);
                                setPaymentAmount('');
                            }}
                            disabled={paymentSchedule.length > 0 && Math.abs(paymentSchedule.reduce((sum, payment) => sum + payment.amount, 0) - (editingLoan ? editingLoan.totalPayback : parseFloat(formData.totalPayback || '0'))) >= 0.01}
                        >
                            {editingLoan ? 'Update Payment Schedule' : 'Done'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};
