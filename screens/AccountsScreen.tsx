import React, { useState, useMemo } from 'react';
import { type Account } from '../types';
import { BankIcon, CashIcon, TrashIcon, XIcon, PlusIcon, PiggyBankIcon } from '../components/Icons';
import { useAppContext } from '../context/AppContext';


const AddAccountForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { handleAddAccount } = useAppContext();
    const [name, setName] = useState('');
    const [type, setType] = useState<'Banque' | 'Espèces' | 'Épargne'>('Banque');
    const [initialBalance, setInitialBalance] = useState('0');

    const handleSubmit = () => {
        if (!name) return;
        handleAddAccount({
            name,
            type,
            initialBalance: parseFloat(initialBalance) || 0,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-dark dark:text-light text-lg">Ajouter un Compte</h3>
                    <button onClick={onClose}><XIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 hover:text-dark dark:hover:text-light" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nom du compte</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Compte Courant" className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-dark dark:text-light" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type de compte</label>
                        <select value={type} onChange={e => setType(e.target.value as any)} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-dark dark:text-light">
                            <option>Banque</option>
                            <option>Espèces</option>
                            <option>Épargne</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Solde initial</label>
                        <input type="number" value={initialBalance} onChange={e => setInitialBalance(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-dark dark:text-light" />
                    </div>
                </div>
                <button onClick={handleSubmit} className="mt-6 w-full bg-primary text-white font-bold py-3 rounded-lg">Enregistrer</button>
            </div>
        </div>
    );
};


const AccountsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { accounts, transactions, handleDeleteAccount } = useAppContext();
    const [showAddForm, setShowAddForm] = useState(false);

    const accountWithBalances = useMemo(() => {
        return accounts.map(account => {
            const accountTransactions = transactions.filter(tx => tx.accountId === account.id || (tx.type === 'transfer' && tx.destinationAccountId === account.id));
            const balance = accountTransactions.reduce((acc, tx) => {
                // If the account is the SOURCE of the transaction
                if (tx.accountId === account.id) {
                    if (tx.type === 'expense') return acc - tx.amount;
                    if (tx.type === 'income') return acc + tx.amount;
                    if (tx.type === 'transfer') {
                        // Amount is debited, plus any fee
                        return acc - tx.amount - (tx.transferFee || 0);
                    }
                }
                // If the account is the DESTINATION of a transfer
                if (tx.type === 'transfer' && tx.destinationAccountId === account.id) {
                    return acc + tx.amount; // The fee is paid by the source, so destination gets the full amount
                }
                return acc;
            }, account.initialBalance);
            return { ...account, balance };
        });
    }, [accounts, transactions]);

    const accountIcons = {
        'Banque': BankIcon,
        'Espèces': CashIcon,
        'Épargne': PiggyBankIcon,
    };

    return (
        <div className="p-4 bg-light dark:bg-gray-900 min-h-full">
            <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="text-primary font-bold">&lt; Retour</button>
                <h1 className="text-xl font-bold text-dark dark:text-light">Multi-Comptes</h1>
                <button onClick={() => setShowAddForm(true)} className="bg-primary text-white text-sm font-bold py-2 px-3 rounded-lg flex items-center">
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Ajouter
                </button>
            </div>
            <div className="space-y-4">
                {accountWithBalances.map(account => {
                    const Icon = accountIcons[account.type];
                    return (
                        <div key={account.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                                    <Icon className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-dark dark:text-light">{account.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{account.type}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg text-dark dark:text-light">{account.balance.toLocaleString('fr-FR')} FCFA</p>
                                <button onClick={() => handleDeleteAccount(account.id)} className="text-danger text-xs hover:underline inline-flex items-center">
                                    <TrashIcon className="w-3 h-3 mr-1" /> Supprimer
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {showAddForm && <AddAccountForm onClose={() => setShowAddForm(false)} />}
        </div>
    );
};

export default AccountsScreen;