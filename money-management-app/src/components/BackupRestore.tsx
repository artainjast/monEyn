import React, { useState, useRef } from 'react';
import { backupService } from '../services/backupService';
import { Button } from './Button';
import { Card } from './Card';
import { Modal } from './Modal';

interface BackupRestoreProps {
    onDataImported?: () => void;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({ onDataImported }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [backupInfo, setBackupInfo] = useState<any>(null);
    const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
    const [skipDuplicates, setSkipDuplicates] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            setError(null);
            await backupService.downloadBackup();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Export failed');
        } finally {
            setIsExporting(false);
        }
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setError(null);
            const info = await backupService.getBackupInfo(file);
            setImportFile(file);
            setBackupInfo(info);
            setShowImportModal(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid backup file');
        }
    };

    const handleImport = async () => {
        if (!importFile) return;

        try {
            setIsImporting(true);
            setError(null);
            await backupService.importFromFile(importFile, {
                mergeMode: importMode,
                skipDuplicates
            });
            setShowImportModal(false);
            setImportFile(null);
            setBackupInfo(null);
            onDataImported?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Import failed');
        } finally {
            setIsImporting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Backup & Restore</h3>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Export Section */}
                        <div className="border-b pb-4">
                            <h4 className="text-md font-medium text-gray-700 mb-3">Export Data</h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Download a complete backup of your financial data as a JSON file.
                                This file can be used to restore your data on another device.
                            </p>
                            <Button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {isExporting ? 'Exporting...' : 'Download Backup'}
                            </Button>
                        </div>

                        {/* Import Section */}
                        <div>
                            <h4 className="text-md font-medium text-gray-700 mb-3">Import Data</h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Restore your data from a previously exported backup file.
                            </p>
                            <div className="flex items-center space-x-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    Select Backup File
                                </Button>
                                <span className="text-sm text-gray-500">
                                    Select a .json backup file
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Import Modal */}
            <Modal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                title="Import Backup Data"
            >
                {backupInfo && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Backup Information</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>Version:</strong> {backupInfo.version}</p>
                                <p><strong>Export Date:</strong> {formatDate(backupInfo.exportDate)}</p>
                                <p><strong>Records:</strong></p>
                                <ul className="ml-4 space-y-1">
                                    <li>• Cards: {backupInfo.recordCounts.cards}</li>
                                    <li>• Categories: {backupInfo.recordCounts.categories}</li>
                                    <li>• Transactions: {backupInfo.recordCounts.transactions}</li>
                                    <li>• Loans: {backupInfo.recordCounts.loans}</li>
                                    <li>• Friend Loans: {backupInfo.recordCounts.friendLoans}</li>
                                    <li>• Settings: {backupInfo.recordCounts.settings}</li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Import Mode
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="replace"
                                            checked={importMode === 'replace'}
                                            onChange={(e) => setImportMode(e.target.value as 'replace' | 'merge')}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">
                                            <strong>Replace All Data</strong> - Clear existing data and import backup
                                        </span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="merge"
                                            checked={importMode === 'merge'}
                                            onChange={(e) => setImportMode(e.target.value as 'replace' | 'merge')}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">
                                            <strong>Merge Data</strong> - Add backup data to existing data
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {importMode === 'merge' && (
                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={skipDuplicates}
                                            onChange={(e) => setSkipDuplicates(e.target.checked)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Skip duplicate records (recommended)</span>
                                    </label>
                                </div>
                            )}

                            {importMode === 'replace' && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Warning:</strong> This will completely replace all your current data with the backup data.
                                        This action cannot be undone.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                onClick={() => setShowImportModal(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={isImporting}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {isImporting ? 'Importing...' : 'Import Data'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
