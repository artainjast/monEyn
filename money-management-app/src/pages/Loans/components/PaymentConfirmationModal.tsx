import React from 'react';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { Select } from '../../../components/Select';
import { Loan, LoanPayment, Card as CardType } from '../../../types';
import { CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedPayment: { loan: Loan; payment: LoanPayment } | null;
    cards: CardType[];
    selectedPaymentCardId: string;
    onCardChange: (cardId: string) => void;
    onConfirm: () => void;
}

export const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
    isOpen,
    onClose,
    selectedPayment,
    cards,
    selectedPaymentCardId,
    onCardChange,
    onConfirm,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Confirm Loan Payment"
            size="md"
        >
            {selectedPayment && (
                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            <div>
                                <h3 className="text-lg font-semibold text-green-800">
                                    Loan Payment Confirmation
                                </h3>
                                <p className="text-green-700">
                                    Paying {selectedPayment.payment.amount.toLocaleString()} {selectedPayment.loan.currency} for {selectedPayment.loan.name}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Payment Details</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Loan:</span>
                                <span className="font-medium">{selectedPayment.loan.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Amount:</span>
                                <span className="font-medium">
                                    {selectedPayment.payment.amount.toLocaleString()} {selectedPayment.loan.currency}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Due Date:</span>
                                <span className="font-medium">
                                    {format(new Date(selectedPayment.payment.dueDate), 'MMM dd, yyyy')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Card to Pay From
                        </label>
                        <Select
                            value={selectedPaymentCardId}
                            onChange={(e) => onCardChange(e.target.value)}
                            options={cards.map(card => ({
                                value: card.id,
                                label: `${card.name} (${card.balance.toLocaleString()} ${card.currency})`
                            }))}
                            required
                        />
                    </div>

                    {selectedPaymentCardId && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-800 mb-2">Balance After Payment</h4>
                            {(() => {
                                const selectedCard = cards.find(c => c.id === selectedPaymentCardId);
                                const newBalance = selectedCard ? selectedCard.balance - selectedPayment.payment.amount : 0;
                                return (
                                    <div className="flex justify-between text-sm">
                                        <span>New Balance:</span>
                                        <span className="font-semibold">
                                            {newBalance.toLocaleString()} {selectedCard?.currency}
                                        </span>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

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
                            variant="success"
                            disabled={!selectedPaymentCardId}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm Payment
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};
