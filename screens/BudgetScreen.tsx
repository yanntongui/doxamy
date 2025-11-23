
import React, { useState, useMemo } from 'react';
import { type BudgetPlan, type BudgetLine } from '../types';
import { XIcon, TrashIcon } from '../components/Icons';
import { useAppContext } from '../context/AppContext';

// --- Props ---
// FIX: Removed onBack prop as this is a main screen.
interface BudgetScreenProps {
}

// --- Data & Mappings ---
const BUDGET_TEMPLATE: Omit<BudgetPlan, 'income' | 'method' | 'id' | 'date'> = {
    sections: [
        {
            title: 'Dépenses Essentielles',
            lines: [
                { id: 'ess-1', category: 'Loyer / Remboursement immo', allocated: 0, spent: 0, notes: '' },
                { id: 'ess-2', category: 'Électricité', allocated: 0, spent: 0, notes: '' },
                { id: 'ess-3', category: 'Eau', allocated: 0, spent: 0, notes: '' },
                { id: 'ess-4', category: 'Internet / Téléphone', allocated: 0, spent: 0, notes: '' },
                { id: 'ess-5', category: 'Alimentation (courses)', allocated: 0, spent: 0, notes: '' },
                { id: 'ess-6', category: 'Transports', allocated: 0, spent: 0, notes: '(Carburant, abonnement, etc.)' },
                { id: 'ess-7', category: 'Assurances', allocated: 0, spent: 0, notes: '(Auto, santé, habitation, etc.)' },
            ],
        },
        {
            title: 'Dépenses Personnelles',
            lines: [
                { id: 'pers-1', category: 'Restaurants / Sorties', allocated: 0, spent: 0, notes: '' },
                { id: 'pers-2', category: 'Shopping / Vêtements', allocated: 0, spent: 0, notes: '' },
                { id: 'pers-3', category: 'Loisirs / Hobbies', allocated: 0, spent: 0, notes: '(Cinéma, sport, musique, etc.)' },
                { id: 'pers-4', category: 'Abonnements', allocated: 0, spent: 0, notes: '(Netflix, Spotify, salle de sport, etc.)' },
                { id: 'pers-5', category: 'Voyages', allocated: 0, spent: 0, notes: '' },
            ],
        },
        {
            title: 'Épargne & Investissements',
            lines: [
                { id: 'ep-1', category: 'Épargne de précaution', allocated: 0, spent: 0, notes: '(Fond d\'urgence)' },
                { id: 'ep-2', category: 'Investissements (bourse, crypto)', allocated: 0, spent: 0, notes: '' },
                { id: 'ep-3', category: 'Remboursement de dettes', allocated: 0, spent: 0, notes: '(Hors prêt immobilier)' },
                { id: 'ep-4', category: 'Épargne pour projet', allocated: 0, spent: 0, notes: '(Voyage, achat d\'une voiture)' },
            ],
        },
    ],
};

// --- Wizard Sub-Component ---
interface BudgetWizardProps {
    onGenerate: (income: number, method: '50/30/20' | '50/25/25' | 'zero') => void;
    onCancel: () => void;
}
const BudgetWizard: React.FC<BudgetWizardProps> = ({ onGenerate, onCancel }) => {
    const [step, setStep] = useState(1);
    const [income, setIncome] = useState('');
    const [method, setMethod] = useState<'50/30/20' | '50/25/25' | 'zero'>('50/30/20');

    const handleGenerate = () => {
        const incomeValue = parseFloat(income);
        if (incomeValue > 0) {
            onGenerate(incomeValue, method);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-dark dark:text-light">Assistant Budgétaire</h2>
                    <button onClick={onCancel} className="text-gray-500 dark:text-text-secondary hover:text-dark dark:hover:text-light"><XIcon className="w-6 h-6" /></button>
                </div>

                {step === 1 && (
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quel est votre revenu mensuel total ?</label>
                        <input type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="Ex: 500000" className="mt-2 block w-full px-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-center text-lg font-semibold focus:outline-none focus:ring-primary focus:border-primary text-dark dark:text-light" />
                        <button onClick={() => setStep(2)} disabled={!income || parseFloat(income) <= 0} className="mt-6 w-full bg-primary text-white font-bold py-3 rounded-lg disabled:bg-gray-400">Suivant</button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Choisissez une méthode de répartition :</p>
                        <div className="space-y-3">
                            {['50/30/20', '50/25/25', 'zero'].map(m => (
                                <button key={m} onClick={() => setMethod(m as any)} className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${method === m ? 'bg-primary/10 border-primary' : 'border-gray-200 dark:border-dark-border hover:border-primary/50'}`}>
                                    <p className="font-bold dark:text-light">{m === '50/30/20' ? '50/30/20 (Équilibré)' : m === '50/25/25' ? '50/25/25 (Focus Épargne)' : 'Base Zéro (Manuel)'}</p>
                                    <p className="text-xs text-gray-600 dark:text-text-muted">{m === '50/30/20' ? '50% Essentiel, 30% Personnel, 20% Épargne' : m === '50/25/25' ? '50% Essentiel, 25% Personnel, 25% Épargne' : 'Attribuez chaque franc de votre revenu.'}</p>
                                </button>
                            ))}
                        </div>
                        <div className="flex space-x-3 mt-6">
                            <button onClick={() => setStep(1)} className="w-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-lg">Précédent</button>
                            <button onClick={handleGenerate} className="w-full bg-secondary text-white font-bold py-3 rounded-lg">Générer le Budget</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Component ---
const BudgetScreen: React.FC<BudgetScreenProps> = () => {
    const { transactions, savedBudgets, handleSaveBudget, handleDeleteBudget: onDeleteBudget } = useAppContext();
    const [activeBudget, setActiveBudget] = useState<BudgetPlan | null>(null);
    const [showWizard, setShowWizard] = useState(false);

    const budgetWithLiveSpent = useMemo(() => {
        if (!activeBudget) return null;

        const newPlan = JSON.parse(JSON.stringify(activeBudget));
        const spentByCategory: { [key: string]: number } = {};

        for (const tx of transactions) {
            if (tx.type === 'expense') {
                const transactionCategory = tx.category;
                const matchingLine = newPlan.sections.flatMap((s: any) => s.lines).find((l: BudgetLine) => {
                    return l.category === transactionCategory;
                });

                if (matchingLine) {
                    spentByCategory[matchingLine.id] = (spentByCategory[matchingLine.id] || 0) + tx.amount;
                }
            }
        }

        for (const section of newPlan.sections) {
            for (const line of section.lines) {
                line.spent = spentByCategory[line.id] || 0;
            }
        }
        return newPlan;
    }, [activeBudget, transactions]);


    const handleGeneratePlan = (income: number, method: '50/30/20' | '50/25/25' | 'zero') => {
        let newPlan: BudgetPlan = {
            id: Date.now().toString(),
            date: `Budget de ${new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}`,
            income,
            method,
            sections: JSON.parse(JSON.stringify(BUDGET_TEMPLATE.sections))
        };

        if (method !== 'zero') {
            const [essentialsPct, personalsPct, savingsPct] = method === '50/30/20' ? [0.5, 0.3, 0.2] : [0.5, 0.25, 0.25];
            const essentialsAmount = income * essentialsPct;
            const personalsAmount = income * personalsPct;
            const savingsAmount = income * savingsPct;

            newPlan.sections[0].lines.find(l => l.id === 'ess-1')!.allocated = essentialsAmount * 0.5;
            newPlan.sections[0].lines.find(l => l.id === 'ess-5')!.allocated = essentialsAmount * 0.3;
            newPlan.sections[0].lines.find(l => l.id === 'ess-6')!.allocated = essentialsAmount * 0.2;
            newPlan.sections[1].lines.find(l => l.id === 'pers-1')!.allocated = personalsAmount * 0.4;
            newPlan.sections[1].lines.find(l => l.id === 'pers-2')!.allocated = personalsAmount * 0.3;
            newPlan.sections[1].lines.find(l => l.id === 'pers-3')!.allocated = personalsAmount * 0.3;
            newPlan.sections[2].lines.find(l => l.id === 'ep-1')!.allocated = savingsAmount;
        }

        setActiveBudget(newPlan);
        setShowWizard(false);
    };

    const handleUpdateLine = (lineId: string, updates: Partial<BudgetLine>) => {
        if (!activeBudget) return;
        const newPlan = JSON.parse(JSON.stringify(activeBudget));
        for (const section of newPlan.sections) {
            const line = section.lines.find((l: BudgetLine) => l.id === lineId);
            if (line) {
                Object.assign(line, updates);
                break;
            }
        }
        setActiveBudget(newPlan);
    };

    const handleAddNewLine = (sectionIndex: number) => {
        if (!activeBudget) return;
        const newPlan = JSON.parse(JSON.stringify(activeBudget));
        newPlan.sections[sectionIndex].lines.push({
            id: Date.now().toString(),
            category: 'Nouvelle catégorie',
            allocated: 0,
            spent: 0,
            notes: '',
        });
        setActiveBudget(newPlan);
    };

    const handleDeleteLine = (sectionIndex: number, lineId: string) => {
        if (!activeBudget) return;
        const newPlan = JSON.parse(JSON.stringify(activeBudget));
        newPlan.sections[sectionIndex].lines = newPlan.sections[sectionIndex].lines.filter(
            (line: BudgetLine) => line.id !== lineId
        );
        setActiveBudget(newPlan);
    };

    const handleSaveAndClose = () => {
        if (!budgetWithLiveSpent) return;
        handleSaveBudget(budgetWithLiveSpent);
        setActiveBudget(null);
    };

    const handleDeleteBudgetAction = () => {
        if (!activeBudget) return;
        onDeleteBudget(activeBudget.id);
        setActiveBudget(null);
    };

    const { totalAllocated, totalSpent } = useMemo(() => {
        if (!budgetWithLiveSpent) return { totalAllocated: 0, totalSpent: 0 };
        let allocated = 0;
        let spent = 0;
        budgetWithLiveSpent.sections.forEach(s => s.lines.forEach(l => {
            allocated += l.allocated;
            spent += l.spent;
        }));
        return { totalAllocated: allocated, totalSpent: spent };
    }, [budgetWithLiveSpent]);

    // Render History View
    if (!budgetWithLiveSpent) {
        return (
            <div className="p-4 bg-light dark:bg-gray-900 min-h-full flex flex-col">
                <div className="flex items-center justify-center mb-6">
                    <h1 className="text-xl font-bold text-dark dark:text-light text-center flex-grow">Mes Budgets</h1>
                </div>

                {savedBudgets.length > 0 ? (
                    <div className="space-y-3">
                        <button onClick={() => setShowWizard(true)} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-blue-700 mb-4">
                            Créer un nouveau budget
                        </button>
                        {savedBudgets.map(budget => (
                            <div key={budget.id} onClick={() => setActiveBudget(budget)} className="bg-white dark:bg-dark-card p-4 rounded-xl cursor-pointer hover:shadow-md dark:hover:bg-gray-700">
                                <p className="font-bold text-dark dark:text-light">{budget.date}</p>
                                <p className="text-sm text-gray-500 dark:text-text-secondary">Revenu: {budget.income.toLocaleString('fr-FR')} FCFA</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                        <p className="text-lg text-gray-600 dark:text-text-muted mb-4">Vous n'avez pas encore de budget.</p>
                        <button onClick={() => setShowWizard(true)} className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700">Créer mon premier budget</button>
                    </div>
                )}

                {showWizard && <BudgetWizard onGenerate={handleGeneratePlan} onCancel={() => setShowWizard(false)} />}
            </div>
        );
    }

    const unallocated = budgetWithLiveSpent.income - totalAllocated;

    // Render Detail/Edit View
    return (
        <div className="p-4 lg:p-6 bg-light dark:bg-gray-900 min-h-full">
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => setActiveBudget(null)} className="text-primary font-bold text-left">&lt; Retour</button>
                <h1 className="text-xl font-bold text-dark dark:text-light text-center flex-grow">{budgetWithLiveSpent.date}</h1>
                <button onClick={handleDeleteBudgetAction} className="text-danger p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-center bg-white dark:bg-dark-card p-3 rounded-xl mb-6">
                <div><p className="text-xs text-gray-500 dark:text-text-secondary">Revenu</p><p className="font-bold text-lg text-success">{budgetWithLiveSpent.income.toLocaleString('fr-FR')}</p></div>
                <div><p className="text-xs text-gray-500 dark:text-text-secondary">Alloué</p><p className="font-bold text-lg text-primary">{totalAllocated.toLocaleString('fr-FR')}</p></div>
                <div className={`col-span-2 md:col-span-1 p-2 rounded-lg ${unallocated === 0 ? 'bg-green-100 dark:bg-green-900/50' : unallocated > 0 ? 'bg-yellow-100 dark:bg-yellow-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                    <p className="text-xs text-gray-600 dark:text-text-secondary">Reste à allouer</p>
                    <p className={`font-bold text-lg ${unallocated === 0 ? 'text-green-700 dark:text-green-300' : unallocated > 0 ? 'text-yellow-800 dark:text-yellow-300' : 'text-red-800 dark:text-red-300'}`}>{unallocated.toLocaleString('fr-FR')}</p>
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-dark-card rounded-xl">
                <table className="w-full text-sm text-left text-gray-500 dark:text-text-secondary">
                    <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-4 py-3 min-w-[200px]">Catégorie</th>
                            <th scope="col" className="px-4 py-3 text-right">Alloué (FCFA)</th>
                            <th scope="col" className="px-4 py-3 text-right">Dépensé (FCFA)</th>
                            <th scope="col" className="px-4 py-3 text-right">% du budget</th>
                            <th scope="col" className="px-4 py-3 min-w-[250px]">Notes</th>
                            <th scope="col" className="px-4 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {budgetWithLiveSpent.sections.map((section, sectionIdx) => (
                            <React.Fragment key={section.title}>
                                <tr className="bg-gray-100 dark:bg-gray-700">
                                    <td colSpan={6} className="px-4 py-2 font-bold text-dark dark:text-light">{section.title}</td>
                                </tr>
                                {section.lines.map((line) => (
                                    <tr key={line.id} className="border-b dark:border-dark-border">
                                        <td className="px-4 py-2 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                            <input
                                                type="text"
                                                value={line.category}
                                                onChange={(e) => handleUpdateLine(line.id, { category: e.target.value })}
                                                className="w-full bg-transparent p-1 -ml-1 focus:bg-gray-50 dark:focus:bg-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <input
                                                type="number"
                                                value={line.allocated}
                                                onChange={(e) => handleUpdateLine(line.id, { allocated: parseFloat(e.target.value) || 0 })}
                                                className="w-24 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-1 text-right focus:ring-primary focus:border-primary text-dark dark:text-light"
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-right font-medium text-dark dark:text-light">{line.spent.toLocaleString('fr-FR')}</td>
                                        <td className="px-4 py-2 text-right">
                                            {budgetWithLiveSpent.income > 0 ? `${((line.allocated / budgetWithLiveSpent.income) * 100).toFixed(1)}%` : '0%'}
                                        </td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="text"
                                                value={line.notes || ''}
                                                onChange={(e) => handleUpdateLine(line.id, { notes: e.target.value })}
                                                className="w-full bg-transparent p-1 -ml-1 focus:bg-gray-50 dark:focus:bg-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <button onClick={() => handleDeleteLine(sectionIdx, line.id)} className="text-danger p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan={6} className="px-4 py-1">
                                        <button onClick={() => handleAddNewLine(sectionIdx)} className="text-sm text-primary font-semibold hover:underline">+ Ajouter une ligne</button>
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                <button onClick={handleSaveAndClose} className="w-full md:w-auto flex-1 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                    Enregistrer & Fermer
                </button>
            </div>
        </div>
    );
};

export default BudgetScreen;
