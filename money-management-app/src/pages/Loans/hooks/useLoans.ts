import { useState, useEffect } from 'react';
import { Loan, Card as CardType } from '../../../types';
import { loansService, cardsService, transactionsService } from '../../../services';

export const useLoans = () => {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [cards, setCards] = useState<CardType[]>([]);
    const [loading, setLoading] = useState(true);

    const loadLoans = async () => {
        try {
            const [loansData, cardsData] = await Promise.all([
                loansService.getAll(),
                cardsService.getAll()
            ]);
            setLoans(loansData);
            setCards(cardsData);
        } catch (error) {
            console.error('Error loading loans:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLoans();
    }, []);

    return {
        loans,
        cards,
        loading,
        loadLoans,
    };
};

export const useLoanPayments = (loans: Loan[], cards: CardType[], loadLoans: () => void) => {
    const [selectedPayment, setSelectedPayment] = useState<{ loan: Loan; payment: any } | null>(null);
    const [selectedPaymentCardId, setSelectedPaymentCardId] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const handleMarkPaymentPaid = async (loanId: string, paymentId: string) => {
        try {
            const loan = loans.find(l => l.id === loanId);
            const payment = loan?.payments.find(p => p.id === paymentId);

            if (loan && payment) {
                setSelectedPayment({ loan, payment });
                setSelectedPaymentCardId(cards[0]?.id || '');
                setShowPaymentModal(true);
            }
        } catch (error) {
            console.error('Error loading payment details:', error);
        }
    };

    const handleConfirmPayment = async () => {
        if (!selectedPayment || !selectedPaymentCardId) return;

        try {
            const { loan, payment } = selectedPayment;

            await loansService.markPaymentPaid(loan.id, payment.id, Date.now());
            // Update the loan payment status
            // await loansService.addPayment(loan.id, {
            //     amount: payment.amount,
            //     dueDate: payment.dueDate,
            //     status: 'paid',
            //     paidDate: new Date(),
            //     paymentCardId: selectedPaymentCardId,
            // });

            // Create a transaction for the payment
            await transactionsService.create({
                type: 'loan_payment',
                amount: payment.amount,
                currency: loan.currency,
                cardId: selectedPaymentCardId,
                description: `Loan payment for ${loan.name}`,
                date: Date.now(),
                source: 'manual',
                loanId: loan.id,
                loanPaymentId: payment.id,
            });

            // Update card balance
            const selectedCard = cards.find(c => c.id === selectedPaymentCardId);
            if (selectedCard) {
                await cardsService.update(selectedPaymentCardId, {
                    balance: selectedCard.balance - payment.amount
                });
            }

            setShowPaymentModal(false);
            setSelectedPayment(null);
            setSelectedPaymentCardId('');
            loadLoans();
        } catch (error) {
            console.error('Error processing payment:', error);
        }
    };

    const closePaymentModal = () => {
        setShowPaymentModal(false);
        setSelectedPayment(null);
        setSelectedPaymentCardId('');
    };

    return {
        selectedPayment,
        selectedPaymentCardId,
        showPaymentModal,
        handleMarkPaymentPaid,
        handleConfirmPayment,
        closePaymentModal,
        setSelectedPaymentCardId,
    };
};

export const useWageFeePayments = (cards: CardType[], loadLoans: () => void) => {
    const [selectedLoanForWageFee, setSelectedLoanForWageFee] = useState<Loan | null>(null);
    const [selectedWageFeeCardId, setSelectedWageFeeCardId] = useState('');
    const [showWageFeeModal, setShowWageFeeModal] = useState(false);

    const handlePayWageFee = async (loan: Loan) => {
        setSelectedLoanForWageFee(loan);
        setSelectedWageFeeCardId(cards[0]?.id || '');
        setShowWageFeeModal(true);
    };

    const handleConfirmWageFeePayment = async () => {
        if (!selectedLoanForWageFee || !selectedWageFeeCardId) return;

        try {
            const loan = selectedLoanForWageFee;

            // Create a transaction for the wage fee payment
            await transactionsService.create({
                type: 'expense',
                amount: loan.wageFee,
                currency: loan.currency,
                cardId: selectedWageFeeCardId,
                description: `Wage fee for loan: ${loan.name}`,
                date: Date.now(),
                source: 'manual',
            });

            // Update the loan to mark wage fee as paid
            await loansService.update(loan.id, {
                wageFeePaid: true,
                wageFeePaymentCardId: selectedWageFeeCardId,
            });

            // Update card balance
            const selectedCard = cards.find(c => c.id === selectedWageFeeCardId);
            if (selectedCard) {
                await cardsService.update(selectedWageFeeCardId, {
                    balance: selectedCard.balance - loan.wageFee
                });
            }

            setShowWageFeeModal(false);
            setSelectedLoanForWageFee(null);
            setSelectedWageFeeCardId('');
            loadLoans();
        } catch (error) {
            console.error('Error processing wage fee payment:', error);
        }
    };

    const closeWageFeeModal = () => {
        setShowWageFeeModal(false);
        setSelectedLoanForWageFee(null);
        setSelectedWageFeeCardId('');
    };

    return {
        selectedLoanForWageFee,
        selectedWageFeeCardId,
        showWageFeeModal,
        handlePayWageFee,
        handleConfirmWageFeePayment,
        closeWageFeeModal,
        setSelectedWageFeeCardId,
    };
};

export const usePeriodicPayments = (loadLoans: () => void) => {
    const [showPeriodicModal, setShowPeriodicModal] = useState(false);
    const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
    const [periodicConfig, setPeriodicConfig] = useState({
        dayOfMonth: 1,
        numberOfMonths: 6,
        amountPerPayment: 0
    });

    const generatePeriodicPayments = (loan: Loan, dayOfMonth: number, numberOfMonths: number) => {
        const payments: { date: Date; amount: number }[] = [];
        const amountPerPayment = loan.totalPayback / numberOfMonths;

        const startDate = new Date(loan.startDate);
        startDate.setDate(dayOfMonth);

        for (let i = 0; i < numberOfMonths; i++) {
            const paymentDate = new Date(startDate);
            paymentDate.setMonth(startDate.getMonth() + i);

            // Ensure the day exists in the month (e.g., Feb 30 becomes Feb 28)
            const lastDayOfMonth = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0).getDate();
            if (dayOfMonth > lastDayOfMonth) {
                paymentDate.setDate(lastDayOfMonth);
            }

            payments.push({
                date: paymentDate,
                amount: amountPerPayment
            });
        }

        return payments;
    };

    const handleConfirmPeriodicPayments = async () => {
        if (!editingLoan) return;

        try {
            const payments = generatePeriodicPayments(
                editingLoan,
                periodicConfig.dayOfMonth,
                periodicConfig.numberOfMonths
            );

            const paymentData = payments.map(payment => ({
                id: '', // Will be generated by the service
                amount: payment.amount,
                dueDate: payment.date.getTime(),
                status: 'pending' as const,
            }));

            await loansService.update(editingLoan.id, { payments: paymentData });
            setShowPeriodicModal(false);
            setEditingLoan(null);
            loadLoans();
        } catch (error) {
            console.error('Error setting up periodic payments:', error);
        }
    };

    const openPeriodicModal = (loan: Loan) => {
        setEditingLoan(loan);
        setShowPeriodicModal(true);
    };

    const closePeriodicModal = () => {
        setShowPeriodicModal(false);
        setEditingLoan(null);
        setPeriodicConfig({
            dayOfMonth: 1,
            numberOfMonths: 6,
            amountPerPayment: 0
        });
    };

    return {
        showPeriodicModal,
        editingLoan,
        periodicConfig,
        setPeriodicConfig,
        handleConfirmPeriodicPayments,
        openPeriodicModal,
        closePeriodicModal,
    };
};
