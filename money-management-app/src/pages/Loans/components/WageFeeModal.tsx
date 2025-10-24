import React from 'react';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { Select } from '../../../components/Select';
import { Loan, Card as CardType } from '../../../types';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface WageFeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedLoan: Loan | null;
    cards: CardType[];
    selectedCardId: string;
    onCardChange: (cardId: string) => void;
    onConfirm: () => void;
}

export const WageFeeModal: React.FC<WageFeeModalProps> = ({
    isOpen,
    onClose,
    selectedLoan,
    cards,
    selectedCardId,
    onCardChange,
    onConfirm,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Pay Wage Fee"
            size="md"
        >
            {selectedLoan && (
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                            <div>
                                <h3 className="text-lg font-semibold text-blue-800">
                                    Pay Wage Fee
                                </h3>
                                <p className="text-blue-700">
                                    Pay {selectedLoan.wageFee.toLocaleString('fa-IR')} {selectedLoan.currency} wage fee for {selectedLoan.name}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Fee Details</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Loan:</span>
                                <span className="font-medium">{selectedLoan.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Wage Fee:</span>
                                <span className="font-medium">
                                    {selectedLoan.wageFee.toLocaleString('fa-IR')} {selectedLoan.currency}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Fee Type:</span>
                                <span className="font-medium">Bank/Loan Provider Fee</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Card to Pay From
                        </label>
                        <Select
                            value={selectedCardId}
                            onChange={(e) => onCardChange(e.target.value)}
                            options={cards.map(card => ({
                                value: card.id,
                                label: `${card.name} (${card.balance.toLocaleString('fa-IR')} ${card.currency})`
                            }))}
                            required
                        />
                    </div>

                    {selectedCardId && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-800 mb-2">Balance After Payment</h4>
                            {(() => {
                                const selectedCard = cards.find(c => c.id === selectedCardId);
                                const newBalance = selectedCard ? selectedCard.balance - selectedLoan.wageFee : 0;
                                return (
                                    <div className="flex justify-between text-sm">
                                        <span>New Balance:</span>
                                        <span className="font-semibold">
                                            {newBalance.toLocaleString('fa-IR')} {selectedCard?.currency}
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
                            disabled={!selectedCardId}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Pay Wage Fee
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};
