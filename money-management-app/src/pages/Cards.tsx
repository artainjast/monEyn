import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
import { Card as CardType } from '../types';
import { cardsService, settingsService } from '../services';
import { Plus, Edit, Trash2, ArrowRightLeft } from 'lucide-react';
import { useAutoAnimate } from '@formkit/auto-animate/react';

export const Cards: React.FC = () => {
    const [cards, setCards] = useState<CardType[]>([]);
    const [currencies, setCurrencies] = useState<{ value: string; label: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [editingCard, setEditingCard] = useState<CardType | null>(null);

    // AutoAnimate hook for cards grid
    const [cardsGridRef] = useAutoAnimate();
    const [transferData, setTransferData] = useState({
        fromCardId: '',
        toCardId: '',
        amount: '',
        description: '',
    });

    const [formData, setFormData] = useState({
        name: '',
        balance: '',
        currency: 'IRR',
        color: '#3B82F6',
    });

    useEffect(() => {
        loadCards();
        loadCurrencies();
    }, []);

    const loadCards = async () => {
        try {
            const cardsData = await cardsService.getAll();
            setCards(cardsData);
        } catch (error) {
            console.error('Error loading cards:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCurrencies = async () => {
        try {
            const settings = await settingsService.get();
            if (settings) {
                const currencyOptions = settings.currencies.map(currency => ({
                    value: currency.code,
                    label: `${currency.name} (${currency.symbol})`,
                }));
                setCurrencies(currencyOptions);
            }
        } catch (error) {
            console.error('Error loading currencies:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const cardData = {
                name: formData.name,
                balance: parseFloat(formData.balance) || 0,
                currency: formData.currency,
                color: formData.color,
            };

            if (editingCard) {
                await cardsService.update(editingCard.id, cardData);
            } else {
                await cardsService.create(cardData);
            }

            setShowAddModal(false);
            setEditingCard(null);
            setFormData({ name: '', balance: '', currency: 'IRR', color: '#3B82F6' });
            loadCards();
        } catch (error) {
            console.error('Error saving card:', error);
        }
    };

    const handleEdit = (card: CardType) => {
        setEditingCard(card);
        setFormData({
            name: card.name,
            balance: card.balance.toString(),
            currency: card.currency,
            color: card.color,
        });
        setShowAddModal(true);
    };

    const handleDelete = async (cardId: string) => {
        if (window.confirm('Are you sure you want to delete this card?')) {
            try {
                await cardsService.delete(cardId);
                loadCards();
            } catch (error) {
                console.error('Error deleting card:', error);
            }
        }
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const amount = parseFloat(transferData.amount);
            if (amount <= 0) return;

            // Create transfer transaction
            await cardsService.updateBalance(transferData.fromCardId, amount, 'subtract');
            await cardsService.updateBalance(transferData.toCardId, amount, 'add');

            setShowTransferModal(false);
            setTransferData({ fromCardId: '', toCardId: '', amount: '', description: '' });
            loadCards();
        } catch (error) {
            console.error('Error transferring money:', error);
        }
    };

    const cardColors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
        '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Cards</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your cards and balances</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button variant="secondary" onClick={() => setShowTransferModal(true)} className="w-full sm:w-auto">
                        <ArrowRightLeft className="w-4 h-4 mr-2" />
                        Transfer
                    </Button>
                    <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Card
                    </Button>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6" ref={cardsGridRef}>
                {cards.map((card) => (
                    <Card key={card.id} className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div
                                    className="w-4 h-4 rounded-full mr-3"
                                    style={{ backgroundColor: card.color }}
                                />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{card.name}</h3>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEdit(card)}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(card.id)}
                                    className="text-gray-400 hover:text-red-600"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Balance</span>
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {card.balance.toLocaleString()} {card.currency}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Currency</span>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{card.currency}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {cards.length === 0 && (
                <div className="text-center py-12 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No cards yet</h2>
                    <p className="text-gray-600 mb-8">Add your first card to get started.</p>
                    <Button onClick={() => setShowAddModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Card
                    </Button>
                </div>
            )}

            {/* Add/Edit Card Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setEditingCard(null);
                    setFormData({ name: '', balance: '', currency: 'IRR', color: '#3B82F6' });
                }}
                title={editingCard ? 'Edit Card' : 'Add New Card'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Card Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <Input
                        label="Initial Balance"
                        type="number"
                        formatNumber={true}
                        value={formData.balance}
                        onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                        required
                    />

                    <Select
                        label="Currency"
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        options={currencies}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color
                        </label>
                        <div className="flex space-x-2">
                            {cardColors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color })}
                                    className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-gray-900' : 'border-gray-300'
                                        }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setShowAddModal(false);
                                setEditingCard(null);
                                setFormData({ name: '', balance: '', currency: 'IRR', color: '#3B82F6' });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingCard ? 'Update Card' : 'Add Card'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Transfer Modal */}
            <Modal
                isOpen={showTransferModal}
                onClose={() => setShowTransferModal(false)}
                title="Transfer Money"
            >
                <form onSubmit={handleTransfer} className="space-y-4">
                    <Select
                        label="From Card"
                        value={transferData.fromCardId}
                        onChange={(e) => setTransferData({ ...transferData, fromCardId: e.target.value })}
                        options={cards.map(card => ({ value: card.id, label: card.name }))}
                        required
                    />

                    <Select
                        label="To Card"
                        value={transferData.toCardId}
                        onChange={(e) => setTransferData({ ...transferData, toCardId: e.target.value })}
                        options={cards.map(card => ({ value: card.id, label: card.name }))}
                        required
                    />

                    <Input
                        label="Amount"
                        type="number"
                        formatNumber={true}
                        value={transferData.amount}
                        onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                        required
                    />

                    <Input
                        label="Description"
                        value={transferData.description}
                        onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                        placeholder="Transfer description"
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowTransferModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            Transfer
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
