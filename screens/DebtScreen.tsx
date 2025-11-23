

import React, { useState, useMemo } from 'react';
import { type DebtCreditItem } from '../types';
import { ScaleIcon, PlusIcon, XIcon, PlusCircleIcon, TrashIcon } from '../components/Icons';
import { useAppContext } from '../context/AppContext';

interface DebtScreenProps {
    onBack: () => void;
}

const DebtScreen: React.FC<DebtScreenProps> = ({ onBack }) => {
    const { debtCreditItems, handleAddDebtCreditItem, handleDeleteDebtCreditItem, handleAddRepayment, accounts } = useAppContext();
    const [activeTab, setActiveTab] = useState<'debts' | 'credits'>('debts');
    const [selectedItem, setSelectedItem] = useState<DebtCreditItem | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const filteredItems = useMemo(() => {
        return debtCreditItems.filter(item => item.type === (activeTab === 'debts' ? 'debt' : 'credit'));
    }, [debtCreditItems, activeTab]);

    const AddItemForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
        const [name, setName] = useState('');
        const [totalAmount, setTotalAmount] = useState('');
        const [amountPaid, setAmountPaid] = useState('0');
        const [type, setType] = useState<'debt' | 'credit'>('debt');

        const handleSubmit = () => {
            if (!name || !totalAmount) return;
            handleAddDebtCreditItem({
                name,
                type,
                totalAmount: parseFloat(totalAmount),
                amountPaid: parseFloat(amountPaid) || 0,
            });
            onClose();
        };

        return (
            <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-dark-card rounded-xl p-6 w-full max-w-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-dark dark:text-light text-lg">Ajouter un élément</h3>
                        <button onClick={onClose}><XIcon className="w-6 h-6 text-gray-500 dark:text-text-secondary" /></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm dark:text-gray-300">Type</label>
                            <select value={type} onChange={e => setType(e.target.value as any)} className="mt-1 block w-full p-2 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-md text-dark dark:text-light">
                                <option value="debt">Dette (Je dois)</option>
                                <option value="credit">Créance (On me doit)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm dark:text-gray-300">Description</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Prêt étudiant" className="mt-1 block w-full p-2 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-md text-dark dark:text-light" />
                        </div>
                        <div>
                            <label className="text-sm dark:text-gray-300">Montant Total</label>
                            <input type="number" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="500000" className="mt-1 block w-full p-2 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-md text-dark dark:text-light" />
                        </div>
                        <div>
                            <label className="text-sm dark:text-gray-300">Montant Initial Payé</label>
                            <input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} className="mt-1 block w-full p-2 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-md text-dark dark:text-light" />
                        </div>
                    </div>
                    <button onClick={handleSubmit} className="mt-6 w-full bg-primary text-white font-bold py-3 rounded-lg">Enregistrer</button>
                </div>
            </div>
        );
    };

    const DetailModal: React.FC<{ item: DebtCreditItem, onClose: () => void }> = ({ item, onClose }) => {
        const [showRepayment, setShowRepayment] = useState(false);
        const [repaymentAmount, setRepaymentAmount] = useState('');
        const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');

        const handleAddRepaymentAction = () => {
            const amount = parseFloat(repaymentAmount);
            if (amount > 0 && selectedAccountId) {
                handleAddRepayment(item.id, amount, selectedAccountId);
                setRepaymentAmount('');
                setShowRepayment(false);
                onClose(); // Close the detail modal after successful repayment
            } else {
                alert("Veuillez sélectionner un compte et entrer un montant valide.");
            }
        };

        const percentage = item.totalAmount > 0 ? (item.amountPaid / item.totalAmount) * 100 : 0;
        const color = item.type === 'debt' ? 'bg-danger' : 'bg-success';

        return (
            <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-dark-card rounded-xl p-6 w-full max-w-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-dark dark:text-light text-lg">Détails</h3>
                        <button onClick={onClose}><XIcon className="w-6 h-6 text-gray-500 dark:text-text-secondary" /></button>
                    </div>
                    <h2 className="text-xl font-bold text-dark dark:text-light text-center">{item.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-text-secondary text-center mb-4">{item.type === 'debt' ? 'Dette' : 'Créance'}</p>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
                        <div className={`${color} h-4 rounded-full`} style={{ width: `${percentage}%` }}></div>
                    </div>
                    <p className="text-center font-semibold text-dark dark:text-light">{item.amountPaid.toLocaleString('fr-FR')} / {item.totalAmount.toLocaleString('fr-FR')} FCFA</p>
                    <p className="text-center text-sm text-gray-500 dark:text-text-secondary">({percentage.toFixed(1)}%)</p>

                    <div className="mt-6">
                        {!showRepayment ? (
                            <button onClick={() => setShowRepayment(true)} className="w-full flex items-center justify-center bg-primary text-white font-bold py-3 rounded-lg">
                                <PlusCircleIcon className="w-5 h-5 mr-2" /> {item.type === 'debt' ? 'Enregistrer un paiement' : 'Enregistrer une rentrée'}
                            </button>
                        ) : (
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Montant</label>
                                    <input type="number" value={repaymentAmount} onChange={e => setRepaymentAmount(e.target.value)} className="mt-1 block w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-dark dark:text-light" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Compte</label>
                                    <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} className="mt-1 block w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-dark dark:text-light">
                                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex space-x-2 mt-2">
                                    <button onClick={() => setShowRepayment(false)} className="flex-1 bg-gray-200 dark:bg-gray-500 py-2 rounded-md text-dark dark:text-light">Annuler</button>
                                    <button onClick={handleAddRepaymentAction} className="flex-1 bg-secondary text-white py-2 rounded-md">Confirmer</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button onClick={() => { handleDeleteDebtCreditItem(item.id); onClose(); }} className="mt-3 w-full text-center py-2 text-danger font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        Supprimer
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 bg-light dark:bg-gray-900 min-h-full">
            <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="text-primary font-bold">&lt; Retour</button>
                <h1 className="text-xl font-bold text-dark dark:text-light">Dettes & Créances</h1>
                <button onClick={() => setShowAddForm(true)} className="bg-primary text-white text-sm font-bold py-2 px-3 rounded-lg flex items-center">
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Ajouter
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-200 dark:bg-gray-800 p-1 mb-4">
                <button onClick={() => setActiveTab('debts')} className={`py-2 rounded-md font-semibold transition-all ${activeTab === 'debts' ? 'bg-white dark:bg-gray-700 text-danger shadow' : 'text-gray-600 dark:text-text-muted'}`}>Mes Dettes</button>
                <button onClick={() => setActiveTab('credits')} className={`py-2 rounded-md font-semibold transition-all ${activeTab === 'credits' ? 'bg-white dark:bg-gray-700 text-success shadow' : 'text-gray-600 dark:text-text-muted'}`}>Mes Créances</button>
            </div>

            <div className="space-y-3">
                {filteredItems.length === 0 && <p className="text-center text-gray-500 dark:text-text-secondary py-8">Aucun élément dans cette catégorie.</p>}
                {filteredItems.map(item => {
                    const percentage = item.totalAmount > 0 ? (item.amountPaid / item.totalAmount) * 100 : 0;
                    const color = item.type === 'debt' ? 'bg-danger' : 'bg-success';
                    return (
                        <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-white dark:bg-dark-card p-4 rounded-xl cursor-pointer hover:shadow-md dark:hover:bg-gray-700">
                            <div className="flex justify-between items-center mb-1">
                                <p className="font-bold text-dark dark:text-light">{item.name}</p>
                                <p className="font-semibold text-sm text-dark dark:text-light">{item.amountPaid.toLocaleString('fr-FR')} / {item.totalAmount.toLocaleString('fr-FR')}</p>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {showAddForm && <AddItemForm onClose={() => setShowAddForm(false)} />}
            {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
        </div>
    );
};

export default DebtScreen;