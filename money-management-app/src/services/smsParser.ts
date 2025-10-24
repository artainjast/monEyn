import { ParsedSMS } from '../types';

export class SMSParser {
    private patterns: { [key: string]: RegExp[] } = {
        // Common Iranian bank SMS patterns
        melli: [
            /خرید.*?(\d{1,3}(?:,\d{3})*)\s*ریال.*?کارت\s*(\d{4})/,
            /برداشت.*?(\d{1,3}(?:,\d{3})*)\s*ریال.*?کارت\s*(\d{4})/,
            /واریز.*?(\d{1,3}(?:,\d{3})*)\s*ریال.*?کارت\s*(\d{4})/,
        ],
        mellat: [
            /مبلغ\s*(\d{1,3}(?:,\d{3})*)\s*ریال.*?کارت\s*(\d{4})/,
            /خرید.*?(\d{1,3}(?:,\d{3})*)\s*ریال/,
        ],
        tejarat: [
            /مبلغ\s*(\d{1,3}(?:,\d{3})*)\s*ریال.*?کارت\s*(\d{4})/,
            /خرید.*?(\d{1,3}(?:,\d{3})*)\s*ریال/,
        ],
        saman: [
            /مبلغ\s*(\d{1,3}(?:,\d{3})*)\s*ریال.*?کارت\s*(\d{4})/,
            /خرید.*?(\d{1,3}(?:,\d{3})*)\s*ریال/,
        ],
        parsian: [
            /مبلغ\s*(\d{1,3}(?:,\d{3})*)\s*ریال.*?کارت\s*(\d{4})/,
            /خرید.*?(\d{1,3}(?:,\d{3})*)\s*ریال/,
        ],
        // Generic patterns
        generic: [
            /(\d{1,3}(?:,\d{3})*)\s*ریال/,
            /(\d{1,3}(?:,\d{3})*)\s*تومان/,
            /(\d+)\s*ریال/,
            /(\d+)\s*تومان/,
        ]
    };

    parseSMS(smsText: string): ParsedSMS | null {
        const normalizedText = this.normalizeText(smsText);

        // Try bank-specific patterns first
        for (const [bankName, patterns] of Object.entries(this.patterns)) {
            if (bankName === 'generic') continue;

            for (const pattern of patterns) {
                const match = normalizedText.match(pattern);
                if (match) {
                    return this.extractTransactionData(normalizedText, match, bankName);
                }
            }
        }

        // Try generic patterns
        for (const pattern of this.patterns.generic) {
            const match = normalizedText.match(pattern);
            if (match) {
                return this.extractTransactionData(normalizedText, match, 'generic');
            }
        }

        return null;
    }

    private normalizeText(text: string): string {
        return text
            .replace(/[\u200C\u200D]/g, '') // Remove zero-width characters
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }

    private extractTransactionData(text: string, match: RegExpMatchArray, _bankName: string): ParsedSMS {
        const amount = this.parseAmount(match[1]);
        const cardNumber = match[2] || this.extractCardNumber(text);
        const transactionType = this.determineTransactionType(text);
        const balance = this.extractBalance(text);
        const merchant = this.extractMerchant(text);
        const description = this.generateDescription(text, amount, transactionType, merchant);

        return {
            amount,
            currency: 'IRR',
            cardNumber,
            transactionType,
            balance,
            merchant,
            description,
            date: Date.now(), // Unix timestamp
        };
    }

    private parseAmount(amountStr: string): number {
        // Remove commas and convert to number
        return parseInt(amountStr.replace(/,/g, ''), 10);
    }

    private extractCardNumber(text: string): string | undefined {
        const cardMatch = text.match(/کارت\s*(\d{4})/);
        return cardMatch ? cardMatch[1] : undefined;
    }

    private determineTransactionType(text: string): 'income' | 'expense' {
        const incomeKeywords = ['واریز', 'دریافت', 'فروش', 'درآمد'];
        const expenseKeywords = ['خرید', 'برداشت', 'پرداخت', 'خرج'];

        const lowerText = text.toLowerCase();

        for (const keyword of incomeKeywords) {
            if (lowerText.includes(keyword)) {
                return 'income';
            }
        }

        for (const keyword of expenseKeywords) {
            if (lowerText.includes(keyword)) {
                return 'expense';
            }
        }

        // Default to expense if unclear
        return 'expense';
    }

    private extractBalance(text: string): number | undefined {
        const balanceMatch = text.match(/موجودی\s*(\d{1,3}(?:,\d{3})*)/);
        if (balanceMatch) {
            return this.parseAmount(balanceMatch[1]);
        }
        return undefined;
    }

    private extractMerchant(text: string): string | undefined {
        // Try to extract merchant name from common patterns
        const merchantPatterns = [
            /از\s*([^،\n]+)/,
            /در\s*([^،\n]+)/,
            /به\s*([^،\n]+)/,
        ];

        for (const pattern of merchantPatterns) {
            const match = text.match(pattern);
            if (match && match[1].length > 2) {
                return match[1].trim();
            }
        }

        return undefined;
    }

    private generateDescription(
        _text: string,
        amount: number,
        type: 'income' | 'expense',
        merchant?: string
    ): string {
        const typeText = type === 'income' ? 'درآمد' : 'خرج';
        const merchantText = merchant ? ` از ${merchant}` : '';
        return `${typeText}${merchantText} - ${amount.toLocaleString()} ریال`;
    }

    // Method to add custom patterns for specific banks
    addCustomPattern(bankName: string, pattern: RegExp): void {
        if (!this.patterns[bankName]) {
            this.patterns[bankName] = [];
        }
        this.patterns[bankName].push(pattern);
    }

    // Method to validate if SMS looks like a bank transaction
    isValidBankSMS(text: string): boolean {
        const bankKeywords = [
            'ریال', 'تومان', 'کارت', 'موجودی', 'خرید', 'برداشت', 'واریز',
            'بانک', 'ملی', 'ملت', 'تجارت', 'سامان', 'پارسیان'
        ];

        const lowerText = text.toLowerCase();
        return bankKeywords.some(keyword => lowerText.includes(keyword));
    }
}

export const smsParser = new SMSParser();
