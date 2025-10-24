import React from 'react';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Loan } from '../../../types';
import { Calendar } from 'lucide-react';

interface PeriodicPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingLoan: Loan | null;
    periodicConfig: {
        dayOfMonth: number;
        numberOfMonths: number;
        amountPerPayment: number;
    };
    onConfigChange: (config: { dayOfMonth: number; numberOfMonths: number; amountPerPayment: number }) => void;
    onConfirm: () => void;
}

export const PeriodicPaymentModal: React.FC<PeriodicPaymentModalProps> = ({
    isOpen,
    onClose,
    editingLoan,
    periodicConfig,
    onConfigChange,
    onConfirm,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingLoan ? `Set Up Periodic Payments for ${editingLoan.name}` : "Set Up Periodic Payments"}
            size="md"
        >
            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                        <div>
                            <h3 className="text-lg font-semibold text-blue-800">
                                Periodic Payment Setup
                            </h3>
                            <p className="text-blue-700">
                                Set up automatic monthly payments for your loan.
                                {editingLoan && ` Total to pay back: ${editingLoan.totalPayback.toLocaleString('fa-IR')} ${editingLoan.currency}`}
                            </p>
                        </div>
                    </div>
                </div>

                {editingLoan && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Loan Details</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Principal Amount:</span>
                                <p className="font-semibold">{editingLoan.principalAmount.toLocaleString('fa-IR')} {editingLoan.currency}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Total Payback:</span>
                                <p className="font-semibold">{editingLoan.totalPayback.toLocaleString('fa-IR')} {editingLoan.currency}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Interest Amount:</span>
                                <p className="font-semibold">{(editingLoan.totalPayback - editingLoan.principalAmount).toLocaleString('fa-IR')} {editingLoan.currency}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Interest Rate:</span>
                                <p className="font-semibold">{editingLoan.interestRate}%</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
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
                                onChange={(e) => onConfigChange({ ...periodicConfig, dayOfMonth: parseInt(e.target.value) })}
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
                                onChange={(e) => onConfigChange({ ...periodicConfig, numberOfMonths: parseInt(e.target.value) })}
                                placeholder="6"
                            />
                            <p className="text-xs text-gray-500 mt-1">How many months to pay over</p>
                        </div>
                    </div>

                    {editingLoan && periodicConfig.numberOfMonths > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-medium text-green-800 mb-2">Payment Preview</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Amount per payment:</span>
                                    <span className="font-semibold">
                                        {(editingLoan.totalPayback / periodicConfig.numberOfMonths).toLocaleString('fa-IR')} {editingLoan.currency}
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

                <div className="flex justify-end space-x-3 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={!periodicConfig.dayOfMonth || !periodicConfig.numberOfMonths}
                    >
                        Set Up Periodic Payments
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
