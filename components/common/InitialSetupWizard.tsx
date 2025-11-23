import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { LogoIcon } from '../Icons';

interface InitialSetupWizardProps {
    onFinish: () => void;
}

const InitialSetupWizard: React.FC<InitialSetupWizardProps> = ({ onFinish }) => {
    const { handleAddAccount, handleAddTransaction, accounts } = useAppContext();
    const [step, setStep] = useState(1);

    // State for Step 1: Account
    const [accountName, setAccountName] = useState('Compte Principal');
    const [accountType, setAccountType] = useState<'Banque' | 'Espèces' | 'Épargne'>('Banque');
    const [initialBalance, setInitialBalance] = useState('');

    // State for Step 2: Transaction
    const [txDescription, setTxDescription] = useState('');
    const [txAmount, setTxAmount] = useState('');
    const [txType, setTxType] = useState<'expense' | 'income'>('expense');

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (accountName && initialBalance) {
            await handleAddAccount({
                name: accountName,
                type: accountType,
                initialBalance: parseFloat(initialBalance),
            });
            setStep(2);
        }
    };

    const handleAddFirstTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (txDescription && txAmount && accounts.length > 0) {
            await handleAddTransaction({
                accountId: accounts[0].id,
                date: new Date().toLocaleDateString('fr-FR'),
                category: txType === 'expense' ? 'Divers' : 'Revenu Initial',
                description: txDescription,
                amount: parseFloat(txAmount),
                type: txType,
                frequency: 'ponctuel',
            });
            onFinish();
        } else {
            // If they skip, just finish
            onFinish();
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1: return (
                <form onSubmit={handleCreateAccount}>
                    <h2 className="text-xl font-bold text-dark dark:text-light mb-2">Créez votre premier compte</h2>
                    <p className="text-sm text-gray-500 dark:text-text-secondary mb-6">Commençons par ajouter votre compte principal.</p>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nom du compte</label>
                            <input type="text" value={accountName} onChange={e => setAccountName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-dark dark:text-light" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Solde actuel (FCFA)</label>
                            <input type="number" value={initialBalance} onChange={e => setInitialBalance(e.target.value)} placeholder="100000" required className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-dark dark:text-light" />
                        </div>
                    </div>
                    <button type="submit" className="mt-8 w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        Continuer
                    </button>
                </form>
            );
            case 2: return (
                <form onSubmit={handleAddFirstTransaction}>
                    <h2 className="text-xl font-bold text-dark dark:text-light mb-2">Enregistrez une transaction</h2>
                    <p className="text-sm text-gray-500 dark:text-text-secondary mb-6">Ajoutez votre dernière dépense ou revenu pour voir comment ça marche.</p>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
                            <button type="button" onClick={() => setTxType('expense')} className={`py-2 rounded-md font-semibold transition-all ${txType === 'expense' ? 'bg-white dark:bg-dark-card text-danger shadow' : 'text-gray-600 dark:text-text-muted'}`}>Dépense</button>
                            <button type="button" onClick={() => setTxType('income')} className={`py-2 rounded-md font-semibold transition-all ${txType === 'income' ? 'bg-white dark:bg-dark-card text-success shadow' : 'text-gray-600 dark:text-text-muted'}`}>Revenu</button>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                            <input type="text" value={txDescription} onChange={e => setTxDescription(e.target.value)} placeholder="Ex: Achat de crédit" required className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-dark dark:text-light" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Montant (FCFA)</label>
                            <input type="number" value={txAmount} onChange={e => setTxAmount(e.target.value)} placeholder="1000" required className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-dark dark:text-light" />
                        </div>
                    </div>
                    <div className="mt-8 flex space-x-3">
                        <button type="button" onClick={onFinish} className="flex-1 w-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                            Plus tard
                        </button>
                        <button type="submit" className="flex-1 w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                            Terminer
                        </button>
                    </div>
                </form>
            );
            default: return null;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-light dark:bg-gray-900">
            <div className="w-full max-w-sm bg-white dark:bg-dark-card rounded-2xl p-8">
                <div className="text-center mb-6">
                    <LogoIcon className="w-12 h-12 text-primary mx-auto mb-3" />
                    <h1 className="text-2xl font-bold text-dark dark:text-light">Configuration</h1>
                </div>
                {renderStep()}
            </div>
        </div>
    );
};

export default InitialSetupWizard;