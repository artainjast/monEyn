import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Category } from '../types';
import { categoriesService } from '../services';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DynamicIcon } from '../components/DynamicIcon';
import { useAutoAnimate } from '@formkit/auto-animate/react';

export const Categories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // AutoAnimate hook for categories grid
    const [categoriesGridRef] = useAutoAnimate();

    const [formData, setFormData] = useState({
        name: '',
        maxBudget: '',
        color: '#3B82F6',
        icon: 'tag',
    });

    const categoryIcons = [
        'tag', 'shopping-cart', 'home', 'car', 'utensils', 'heart',
        'book', 'gamepad2', 'shirt', 'phone', 'laptop', 'plane'
    ];

    const categoryColors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
        '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ];

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const categoriesData = await categoriesService.getAll();
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const categoryData = {
                name: formData.name,
                maxBudget: formData.maxBudget ? parseFloat(formData.maxBudget) : undefined,
                color: formData.color,
                icon: formData.icon,
            };

            if (editingCategory) {
                await categoriesService.update(editingCategory.id, categoryData);
            } else {
                await categoriesService.create(categoryData);
            }

            setShowAddModal(false);
            setEditingCategory(null);
            setFormData({ name: '', maxBudget: '', color: '#3B82F6', icon: 'tag' });
            loadCategories();
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            maxBudget: category.maxBudget?.toString() || '',
            color: category.color,
            icon: category.icon,
        });
        setShowAddModal(true);
    };

    const handleDelete = async (categoryId: string) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await categoriesService.delete(categoryId);
                loadCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };


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
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
                    <p className="text-gray-600 dark:text-gray-400">Organize your expenses by categories</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                </Button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6" ref={categoriesGridRef}>
                {categories.map((category) => (
                    <Card key={category.id} className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div
                                    className="w-8 h-8 rounded-lg mr-3 flex items-center justify-center text-white"
                                    style={{ backgroundColor: category.color }}
                                >
                                    <DynamicIcon name={category.icon} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEdit(category)}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(category.id)}
                                    className="text-gray-400 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {category.maxBudget && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Budget Limit</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {category.maxBudget.toLocaleString()} ریال
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Icon</span>
                                <span className="text-sm text-gray-700">{category.icon}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {categories.length === 0 && (
                <div className="text-center py-12 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No categories yet</h2>
                    <p className="text-gray-600 mb-8">Create categories to organize your expenses.</p>
                    <Button onClick={() => setShowAddModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Category
                    </Button>
                </div>
            )}

            {/* Add/Edit Category Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setEditingCategory(null);
                    setFormData({ name: '', maxBudget: '', color: '#3B82F6', icon: 'tag' });
                }}
                title={editingCategory ? 'Edit Category' : 'Add New Category'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Category Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <Input
                        label="Budget Limit (Optional)"
                        type="number"
                        formatNumber={true}
                        value={formData.maxBudget}
                        onChange={(e) => setFormData({ ...formData, maxBudget: e.target.value })}
                        placeholder="Leave empty for no limit"
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Icon
                        </label>
                        <div className="grid grid-cols-6 gap-2">
                            {categoryIcons.map((icon) => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon })}
                                    className={`p-2 rounded-lg border-2 ${formData.icon === icon ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                                        }`}
                                >
                                    <DynamicIcon name={icon} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color
                        </label>
                        <div className="flex space-x-2">
                            {categoryColors.map((color) => (
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
                                setEditingCategory(null);
                                setFormData({ name: '', maxBudget: '', color: '#3B82F6', icon: 'tag' });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingCategory ? 'Update Category' : 'Add Category'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
