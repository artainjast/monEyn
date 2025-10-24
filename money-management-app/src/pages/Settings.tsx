import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
import { BackupRestore } from '../components/BackupRestore';
import { Settings as SettingsType, Currency } from '../types';
import { settingsService } from '../services';
import { Plus, Edit, Trash2, Save, RefreshCw } from 'lucide-react';

export const Settings: React.FC = () => {
    const [settings, setSettings] = useState<SettingsType | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddCurrencyModal, setShowAddCurrencyModal] = useState(false);
    const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        symbol: '',
        exchangeRate: '',
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const settingsData = await settingsService.get();
            setSettings(settingsData);
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDefaultCurrency = async (currencyCode: string) => {
        try {
            await settingsService.update({ defaultCurrency: currencyCode });
            loadSettings();
        } catch (error) {
            console.error('Error updating default currency:', error);
        }
    };

    const handleAddCurrency = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!settings) return;

            const newCurrency: Currency = {
                code: formData.code.toUpperCase(),
                name: formData.name,
                symbol: formData.symbol,
                exchangeRate: parseFloat(formData.exchangeRate),
            };

            const updatedCurrencies = [...settings.currencies, newCurrency];
            await settingsService.update({ currencies: updatedCurrencies });

            setShowAddCurrencyModal(false);
            setFormData({ code: '', name: '', symbol: '', exchangeRate: '' });
            loadSettings();
        } catch (error) {
            console.error('Error adding currency:', error);
        }
    };

    const handleEditCurrency = (currency: Currency) => {
        setEditingCurrency(currency);
        setFormData({
            code: currency.code,
            name: currency.name,
            symbol: currency.symbol,
            exchangeRate: currency.exchangeRate.toString(),
        });
        setShowAddCurrencyModal(true);
    };

    const handleUpdateCurrency = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!settings || !editingCurrency) return;

            const updatedCurrency: Currency = {
                code: formData.code.toUpperCase(),
                name: formData.name,
                symbol: formData.symbol,
                exchangeRate: parseFloat(formData.exchangeRate),
            };

            const updatedCurrencies = settings.currencies.map(c =>
                c.code === editingCurrency.code ? updatedCurrency : c
            );

            await settingsService.update({ currencies: updatedCurrencies });

            setShowAddCurrencyModal(false);
            setEditingCurrency(null);
            setFormData({ code: '', name: '', symbol: '', exchangeRate: '' });
            loadSettings();
        } catch (error) {
            console.error('Error updating currency:', error);
        }
    };

    const handleDeleteCurrency = async (currencyCode: string) => {
        if (window.confirm('Are you sure you want to delete this currency?')) {
            try {
                if (!settings) return;

                const updatedCurrencies = settings.currencies.filter(c => c.code !== currencyCode);
                await settingsService.update({ currencies: updatedCurrencies });

                // If deleted currency was default, set first remaining as default
                if (settings.defaultCurrency === currencyCode && updatedCurrencies.length > 0) {
                    await settingsService.update({ defaultCurrency: updatedCurrencies[0].code });
                }

                loadSettings();
            } catch (error) {
                console.error('Error deleting currency:', error);
            }
        }
    };

    const handleUpdateExchangeRate = async (currencyCode: string, newRate: number) => {
        try {
            if (!settings) return;

            const updatedCurrencies = settings.currencies.map(c =>
                c.code === currencyCode ? { ...c, exchangeRate: newRate } : c
            );

            await settingsService.update({ currencies: updatedCurrencies });
            loadSettings();
        } catch (error) {
            console.error('Error updating exchange rate:', error);
        }
    };

    const handleRefreshRates = async () => {
        // In a real app, this would fetch rates from an API
        // For now, we'll just show a message
        alert('Exchange rates refreshed! (This would fetch from an API in a real app)');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="text-center py-12 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings not found</h2>
                <p className="text-gray-600">There was an error loading settings.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600">Manage your app preferences</p>
                </div>
                <Button variant="secondary" onClick={handleRefreshRates} className="w-full sm:w-auto">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Rates
                </Button>
            </div>

            {/* Default Currency */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Currency</h3>
                <div className="flex items-center space-x-4">
                    <Select
                        value={settings.defaultCurrency}
                        onChange={(e) => handleUpdateDefaultCurrency(e.target.value)}
                        options={settings.currencies.map(currency => ({
                            value: currency.code,
                            label: `${currency.name} (${currency.symbol})`,
                        }))}
                    />
                    <p className="text-sm text-gray-500">
                        This currency will be used for calculations and displays
                    </p>
                </div>
            </Card>

            {/* Currencies Management */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Currencies</h3>
                    <Button onClick={() => setShowAddCurrencyModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Currency
                    </Button>
                </div>

                <div className="space-y-4">
                    {settings.currencies.map((currency) => (
                        <div key={currency.code} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-4">
                                <div className="text-center">
                                    <p className="font-semibold text-gray-900">{currency.code}</p>
                                    <p className="text-sm text-gray-500">{currency.name}</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-medium text-gray-900">{currency.symbol}</p>
                                    <p className="text-sm text-gray-500">Symbol</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-medium text-gray-900">{currency.exchangeRate}</p>
                                    <p className="text-sm text-gray-500">Exchange Rate</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Input
                                    type="number"
                                    step="0.01"
                                    formatNumber={true}
                                    value={currency.exchangeRate}
                                    onChange={(e) => {
                                        const newRate = parseFloat(e.target.value);
                                        if (!isNaN(newRate)) {
                                            handleUpdateExchangeRate(currency.code, newRate);
                                        }
                                    }}
                                    className="w-24"
                                />
                                <button
                                    onClick={() => handleEditCurrency(currency)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                {currency.code !== settings.defaultCurrency && (
                                    <button
                                        onClick={() => handleDeleteCurrency(currency.code)}
                                        className="text-gray-400 hover:text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Data Backup & Restore */}
            <BackupRestore onDataImported={loadSettings} />

            {/* App Information */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">App Information</h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Version</span>
                        <span className="font-medium">1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated</span>
                        <span className="font-medium">
                            {/* {format(settings.lastUpdated, 'MMM dd, yyyy')} */}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Database</span>
                        <span className="font-medium">IndexedDB</span>
                    </div>
                </div>
            </Card>

            {/* Add/Edit Currency Modal */}
            <Modal
                isOpen={showAddCurrencyModal}
                onClose={() => {
                    setShowAddCurrencyModal(false);
                    setEditingCurrency(null);
                    setFormData({ code: '', name: '', symbol: '', exchangeRate: '' });
                }}
                title={editingCurrency ? 'Edit Currency' : 'Add New Currency'}
            >
                <form onSubmit={editingCurrency ? handleUpdateCurrency : handleAddCurrency} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Currency Code"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="USD, EUR, etc."
                            required
                        />

                        <Input
                            label="Currency Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="US Dollar"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Symbol"
                            value={formData.symbol}
                            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                            placeholder="$"
                            required
                        />

                        <Input
                            label="Exchange Rate"
                            type="number"
                            step="0.01"
                            formatNumber={true}
                            value={formData.exchangeRate}
                            onChange={(e) => setFormData({ ...formData, exchangeRate: e.target.value })}
                            placeholder="42000"
                            required
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Exchange rate is relative to your default currency ({settings.defaultCurrency}).
                            For example, if USD rate is 42000, it means 1 USD = 42000 {settings.defaultCurrency}.
                        </p>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setShowAddCurrencyModal(false);
                                setEditingCurrency(null);
                                setFormData({ code: '', name: '', symbol: '', exchangeRate: '' });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            <Save className="w-4 h-4 mr-2" />
                            {editingCurrency ? 'Update Currency' : 'Add Currency'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
