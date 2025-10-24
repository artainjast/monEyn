import { db } from './database';
import { Card, Category, Transaction, Loan, Settings, FriendLoan } from '../types';

export interface BackupData {
    version: string;
    exportDate: string;
    cards: Card[];
    categories: Category[];
    transactions: Transaction[];
    loans: Loan[];
    friendLoans: FriendLoan[];
    settings: Settings[];
}

// Helper function for type assertion
function validateBackupDataStructure(data: any): asserts data is BackupData {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid backup data format');
    }

    const requiredFields = ['version', 'exportDate', 'cards', 'categories', 'transactions', 'loans', 'friendLoans', 'settings'];
    for (const field of requiredFields) {
        if (!(field in data)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    if (!Array.isArray(data.cards) || !Array.isArray(data.categories) ||
        !Array.isArray(data.transactions) || !Array.isArray(data.loans) ||
        !Array.isArray(data.friendLoans) || !Array.isArray(data.settings)) {
        throw new Error('Invalid data structure - arrays expected');
    }
}

export const backupService = {
    /**
     * Export all data from IndexedDB to a JSON backup
     */
    async exportData(): Promise<BackupData> {
        try {
            const [cards, categories, transactions, loans, friendLoans, settings] = await Promise.all([
                db.cards.toArray(),
                db.categories.toArray(),
                db.transactions.toArray(),
                db.loans.toArray(),
                db.friendLoans.toArray(),
                db.settings.toArray()
            ]);

            const backupData: BackupData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                cards,
                categories,
                transactions,
                loans,
                friendLoans,
                settings
            };

            return backupData;
        } catch (error) {
            console.error('Error exporting data:', error);
            throw new Error('Failed to export data');
        }
    },

    /**
     * Export data and download as JSON file
     */
    async downloadBackup(): Promise<void> {
        try {
            const backupData = await this.exportData();
            const jsonString = JSON.stringify(backupData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `money-management-backup-${new Date().toISOString().split('T')[0]}.json`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading backup:', error);
            throw new Error('Failed to download backup');
        }
    },

    /**
     * Import data from JSON backup
     */
    async importData(backupData: BackupData, options: {
        mergeMode: 'replace' | 'merge';
        skipDuplicates: boolean;
    } = { mergeMode: 'replace', skipDuplicates: true }): Promise<void> {
        try {
            // Validate backup data structure
            validateBackupDataStructure(backupData);

            if (options.mergeMode === 'replace') {
                // Clear existing data
                await Promise.all([
                    db.cards.clear(),
                    db.categories.clear(),
                    db.transactions.clear(),
                    db.loans.clear(),
                    db.friendLoans.clear(),
                    db.settings.clear()
                ]);
            }

            // Import data based on merge mode
            if (options.mergeMode === 'replace') {
                // Direct import for replace mode
                await Promise.all([
                    db.cards.bulkAdd(backupData.cards),
                    db.categories.bulkAdd(backupData.categories),
                    db.transactions.bulkAdd(backupData.transactions),
                    db.loans.bulkAdd(backupData.loans),
                    db.friendLoans.bulkAdd(backupData.friendLoans),
                    db.settings.bulkAdd(backupData.settings)
                ]);
            } else {
                // Merge mode - handle duplicates
                await backupService.mergeData(backupData, options.skipDuplicates);
            }

        } catch (error) {
            console.error('Error importing data:', error);
            throw new Error('Failed to import data');
        }
    },

    /**
     * Import data from uploaded file
     */
    async importFromFile(file: File, options: {
        mergeMode: 'replace' | 'merge';
        skipDuplicates: boolean;
    } = { mergeMode: 'replace', skipDuplicates: true }): Promise<void> {
        try {
            const text = await file.text();
            const backupData: BackupData = JSON.parse(text);
            await this.importData(backupData, options);
        } catch (error) {
            console.error('Error importing from file:', error);
            throw new Error('Invalid backup file format');
        }
    },


    /**
     * Merge imported data with existing data
     */
    async mergeData(backupData: BackupData, skipDuplicates: boolean): Promise<void> {
        // Merge cards
        for (const card of backupData.cards) {
            const existing = await db.cards.get(card.id);
            if (!existing || !skipDuplicates) {
                await db.cards.put(card);
            }
        }

        // Merge categories
        for (const category of backupData.categories) {
            const existing = await db.categories.get(category.id);
            if (!existing || !skipDuplicates) {
                await db.categories.put(category);
            }
        }

        // Merge transactions
        for (const transaction of backupData.transactions) {
            const existing = await db.transactions.get(transaction.id);
            if (!existing || !skipDuplicates) {
                await db.transactions.put(transaction);
            }
        }

        // Merge loans
        for (const loan of backupData.loans) {
            const existing = await db.loans.get(loan.id);
            if (!existing || !skipDuplicates) {
                await db.loans.put(loan);
            }
        }

        // Merge friend loans
        for (const friendLoan of backupData.friendLoans) {
            const existing = await db.friendLoans.get(friendLoan.id);
            if (!existing || !skipDuplicates) {
                await db.friendLoans.put(friendLoan);
            }
        }

        // Merge settings
        for (const setting of backupData.settings) {
            const existing = await db.settings.get(setting.id);
            if (!existing || !skipDuplicates) {
                await db.settings.put(setting);
            }
        }
    },

    /**
     * Get backup file info without importing
     */
    async getBackupInfo(file: File): Promise<{
        version: string;
        exportDate: string;
        recordCounts: {
            cards: number;
            categories: number;
            transactions: number;
            loans: number;
            friendLoans: number;
            settings: number;
        };
    }> {
        try {
            const text = await file.text();
            const backupData: BackupData = JSON.parse(text);

            validateBackupDataStructure(backupData);

            return {
                version: backupData.version,
                exportDate: backupData.exportDate,
                recordCounts: {
                    cards: backupData.cards.length,
                    categories: backupData.categories.length,
                    transactions: backupData.transactions.length,
                    loans: backupData.loans.length,
                    friendLoans: backupData.friendLoans.length,
                    settings: backupData.settings.length
                }
            };
        } catch (error) {
            throw new Error('Invalid backup file');
        }
    }
};
