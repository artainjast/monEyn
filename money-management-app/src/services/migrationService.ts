import { db } from './database';

export interface MigrationInfo {
    version: number;
    description: string;
    completed: boolean;
    timestamp?: number;
}

export class MigrationService {
    private static readonly MIGRATION_KEY = 'database_migrations';

    static async getMigrationHistory(): Promise<MigrationInfo[]> {
        try {
            const history = localStorage.getItem(this.MIGRATION_KEY);
            return history ? JSON.parse(history) : [];
        } catch {
            return [];
        }
    }

    static async recordMigration(version: number, description: string): Promise<void> {
        try {
            const history = await this.getMigrationHistory();
            const migration: MigrationInfo = {
                version,
                description,
                completed: true,
                timestamp: Date.now()
            };

            // Remove any existing record for this version
            const filteredHistory = history.filter((m: MigrationInfo) => m.version !== version);
            filteredHistory.push(migration);

            localStorage.setItem(this.MIGRATION_KEY, JSON.stringify(filteredHistory));
        } catch (error) {
            console.error('Failed to record migration:', error);
        }
    }

    static async checkForMigrations(): Promise<void> {
        try {
            // Check if this is a fresh install or if migrations are needed
            const history = await this.getMigrationHistory();
            const currentVersion = db.verno;

            // Check if we need to run migration from version 4 to 5
            if (currentVersion >= 5) {
                const v5Migration = history.find(m => m.version === 5);
                if (!v5Migration) {
                    await this.recordMigration(5, 'Upgraded to multi-category transactions');
                    console.log('✅ Database migrated to version 5: Multi-category support enabled');
                }
            }
        } catch (error) {
            console.error('Migration check failed:', error);
        }
    }

    static async showMigrationNotification(): Promise<boolean> {
        try {
            const history = await this.getMigrationHistory();
            const v5Migration = history.find(m => m.version === 5);

            if (!v5Migration) {
                // Show notification about the new multi-category feature
                const shouldShow = window.confirm(
                    '🎉 New Feature Available!\n\n' +
                    'Your transactions now support multiple categories!\n\n' +
                    '• Assign multiple categories to a single transaction\n' +
                    '• Better organization and tracking\n' +
                    '• Your existing data has been automatically migrated\n\n' +
                    'Would you like to learn more about this feature?'
                );

                if (shouldShow) {
                    await this.recordMigration(5, 'Upgraded to multi-category transactions');
                }

                return shouldShow;
            }

            return false;
        } catch (error) {
            console.error('Migration notification failed:', error);
            return false;
        }
    }
}
