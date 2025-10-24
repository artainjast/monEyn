import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

interface PaymentScheduleItem {
    date: number; // Unix timestamp
    amount: number;
}

interface PaymentCalendarProps {
    paymentSchedule: PaymentScheduleItem[];
    onDateClick: (timestamp: number) => void;
    selectedDate: number | null; // Unix timestamp
}

export const PaymentCalendar: React.FC<PaymentCalendarProps> = ({
    paymentSchedule,
    onDateClick,
    selectedDate
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get the first day of the month and calculate how many empty cells we need
    const firstDayOfMonth = monthStart.getDay();
    const emptyCells = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const isPaymentScheduled = (date: Date) => {
        return paymentSchedule.some(payment => isSameDay(new Date(payment.date), date));
    };

    const getPaymentAmount = (date: Date) => {
        const payment = paymentSchedule.find(payment => isSameDay(new Date(payment.date), date));
        return payment ? payment.amount : 0;
    };

    const isDateSelected = (date: Date) => {
        return selectedDate && isSameDay(date, new Date(selectedDate));
    };

    const isPastDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <h3 className="text-lg font-semibold text-gray-900">
                    {format(currentMonth, 'MMMM yyyy')}
                </h3>

                <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the first day of the month */}
                {emptyCells.map((_, index) => (
                    <div key={`empty-${index}`} className="h-10"></div>
                ))}

                {/* Days of the month */}
                {days.map((day) => {
                    const hasPayment = isPaymentScheduled(day);
                    const isSelected = isDateSelected(day);
                    const isPast = isPastDate(day);
                    const paymentAmount = getPaymentAmount(day);

                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => !isPast && onDateClick(day.getTime())}
                            disabled={isPast}
                            className={`
                                h-10 text-sm rounded-lg transition-all duration-200 relative
                                ${isPast
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'hover:bg-blue-50 cursor-pointer'
                                }
                                ${isSelected
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : hasPayment
                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }
                            `}
                        >
                            <div className="flex flex-col items-center justify-center h-full">
                                <span className="text-xs font-medium">
                                    {format(day, 'd')}
                                </span>
                                {hasPayment && (
                                    <span className="text-xs font-bold persian-numbers">
                                        {paymentAmount.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-100 rounded mr-1"></div>
                    <span className="text-gray-600">Payment scheduled</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
                    <span className="text-gray-600">Selected</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-300 rounded mr-1"></div>
                    <span className="text-gray-600">Past dates</span>
                </div>
            </div>
        </div>
    );
};
