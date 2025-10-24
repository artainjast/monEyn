import { Loan, LoanPayment } from '../types';
import { addMonths, setDate, isBefore, addDays } from 'date-fns';

export class LoanCalculator {
    calculateLoanSchedule(loan: Omit<Loan, 'id' | 'payments'>): LoanPayment[] {
        const payments: LoanPayment[] = [];
        const { totalPayback, startDate, endDate, paymentDay } = loan;

        const totalPayments = this.getTotalPaymentCount(startDate, endDate, paymentDay || 1);
        const monthlyPayment = totalPayback / totalPayments;

        let currentDate = this.getFirstPaymentDate(startDate, paymentDay || 1);
        let remainingBalance = totalPayback;

        for (let i = 0; i < totalPayments; i++) {
            const paymentAmount = i === totalPayments - 1
                ? remainingBalance
                : monthlyPayment;

            const payment: LoanPayment = {
                id: `payment-${i}`,
                amount: Math.round(paymentAmount),
                dueDate: currentDate, // Unix timestamp
                status: 'pending',
            };

            payments.push(payment);
            remainingBalance -= paymentAmount;
            currentDate = addMonths(new Date(currentDate), 1).getTime();
        }

        return payments;
    }

    private getTotalPaymentCount(startDate: number, endDate: number, paymentDay: number): number {
        const firstPaymentDate = this.getFirstPaymentDate(startDate, paymentDay);
        let count = 0;
        let currentDate = new Date(firstPaymentDate);

        while (isBefore(currentDate, new Date(endDate)) || currentDate.getTime() === endDate) {
            count++;
            currentDate = addMonths(currentDate, 1);
        }

        return count;
    }

    private getFirstPaymentDate(startDate: number, paymentDay: number): number {
        const startDateObj = new Date(startDate);
        const firstPaymentDate = setDate(startDateObj, paymentDay);

        // If the payment day has already passed this month, move to next month
        if (isBefore(firstPaymentDate, startDateObj)) {
            return addMonths(firstPaymentDate, 1).getTime();
        }

        return firstPaymentDate.getTime();
    }

    calculateInterest(principalAmount: number, totalPayback: number, months: number): number {
        // Handle edge cases
        if (principalAmount <= 0 || months <= 0) {
            return 0;
        }

        const totalInterest = totalPayback - principalAmount;

        // If no interest, return 0
        if (totalInterest <= 0) {
            return 0;
        }

        const annualRate = (totalInterest / principalAmount) * (12 / months) * 100;

        // Handle NaN or infinite values
        if (isNaN(annualRate) || !isFinite(annualRate)) {
            return 0;
        }

        return Math.round(annualRate * 100) / 100; // Round to 2 decimal places
    }

    calculateTotalPayback(principalAmount: number, annualInterestRate: number, months: number): number {
        // Handle edge cases
        if (principalAmount <= 0 || months <= 0) {
            return principalAmount;
        }

        // If no interest rate, return principal amount
        if (annualInterestRate <= 0) {
            return principalAmount;
        }

        // Simple interest calculation
        const monthlyRate = annualInterestRate / 100 / 12;
        const totalInterest = principalAmount * monthlyRate * months;
        const totalPayback = principalAmount + totalInterest;

        // Handle NaN or infinite values
        if (isNaN(totalPayback) || !isFinite(totalPayback)) {
            return principalAmount;
        }

        return Math.round(totalPayback * 100) / 100; // Round to 2 decimal places
    }

    calculateFromInterestRate(principalAmount: number, annualInterestRate: number, startDate: number, endDate: number): number {
        const months = this.getTotalPaymentCount(startDate, endDate, 1); // Use day 1 for calculation
        return this.calculateTotalPayback(principalAmount, annualInterestRate, months);
    }

    calculateFromTotalPayback(principalAmount: number, totalPayback: number, startDate: number, endDate: number): number {
        const months = this.getTotalPaymentCount(startDate, endDate, 1); // Use day 1 for calculation
        return this.calculateInterest(principalAmount, totalPayback, months);
    }

    getLoanMonths(startDate: number, endDate: number): number {
        return this.getTotalPaymentCount(startDate, endDate, 1);
    }

    getRemainingBalance(loan: Loan): number {
        const totalPaid = loan.payments
            .filter(payment => payment.status === 'paid')
            .reduce((sum, payment) => sum + payment.amount, 0);

        return loan.totalPayback - totalPaid;
    }

    getNextPayment(loan: Loan): LoanPayment | null {
        const nextPayment = loan.payments
            .filter(payment => payment.status === 'pending')
            .sort((a, b) => a.dueDate - b.dueDate)[0];

        return nextPayment || null;
    }

    getOverduePayments(loan: Loan): LoanPayment[] {
        const today = Date.now();
        return loan.payments.filter(payment =>
            payment.status === 'pending' &&
            payment.dueDate < today
        );
    }

    getUpcomingPayments(loan: Loan, daysAhead: number = 30): LoanPayment[] {
        const today = Date.now();
        const futureDate = addDays(new Date(today), daysAhead).getTime();

        return loan.payments.filter(payment =>
            payment.status === 'pending' &&
            payment.dueDate > today &&
            payment.dueDate < futureDate
        );
    }

    markPaymentAsPaid(loan: Loan, paymentId: string, paidDate?: number): Loan {
        const updatedPayments = loan.payments.map(payment => {
            if (payment.id === paymentId) {
                return {
                    ...payment,
                    status: 'paid' as const,
                    paidDate: paidDate || Date.now(),
                };
            }
            return payment;
        });

        return {
            ...loan,
            payments: updatedPayments,
        };
    }

    updateLoanStatus(loan: Loan): Loan {
        const remainingBalance = this.getRemainingBalance(loan);
        const overduePayments = this.getOverduePayments(loan);

        let status: Loan['status'] = loan.status;

        if (remainingBalance <= 0) {
            status = 'completed';
        } else if (overduePayments.length > 0) {
            status = 'defaulted';
        } else {
            status = 'active';
        }

        return {
            ...loan,
            status,
        };
    }

    getLoanSummary(loan: Loan) {
        const remainingBalance = this.getRemainingBalance(loan);
        const nextPayment = this.getNextPayment(loan);
        const overduePayments = this.getOverduePayments(loan);
        const upcomingPayments = this.getUpcomingPayments(loan);

        return {
            remainingBalance,
            nextPayment,
            overduePayments,
            upcomingPayments,
            totalPaid: loan.totalPayback - remainingBalance,
            progressPercentage: ((loan.totalPayback - remainingBalance) / loan.totalPayback) * 100,
        };
    }
}

export const loanCalculator = new LoanCalculator();
