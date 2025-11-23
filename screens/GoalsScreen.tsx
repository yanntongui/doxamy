import React, { useState, useMemo } from 'react';
import { type Goal, type Contribution } from '../types';
import { CarIcon, HouseIcon, ShoppingBagIcon, AwardIcon, FireIcon, XIcon, PlusIcon, CalendarIcon, InfoIcon, iconMap } from '../components/Icons';
import { useAppContext } from '../context/AppContext';

// --- Helper Functions ---
const calculateStreak = (contributions: Contribution[]): number => {
    if (contributions.length === 0) return 0;

    const uniqueDates = [...new Set(contributions.map(c => new Date(c.date).setHours(0, 0, 0, 0)))].sort((a, b) => b - a);
    if (uniqueDates.length === 0) return 0;

    let streak = 1;
    let lastDate = new Date(uniqueDates[0]);
    const oneDay = 1000 * 60 * 60 * 24;

    for (let i = 1; i < uniqueDates.length; i++) {
        const currentDate = new Date(uniqueDates[i]);
        if ((lastDate.getTime() - currentDate.getTime()) / oneDay === 1) {
            streak++;
            lastDate = currentDate;
        } else {
            break;
        }
    }
    return streak;
};

// --- Sub-Components ---
const GoalDetail: React.FC<{ goal: Goal; onBack: () => void; userLevel: string; streak: number }> = ({ goal, onBack, userLevel, streak }) => {
    const { handleAddContribution, accounts } = useAppContext();
    const [showAddMoney, setShowAddMoney] = useState(false);
    const [amountToAdd, setAmountToAdd] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');

    const percentage = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;

    const handleContributionSubmit = () => {
        const amount = parseFloat(amountToAdd);
        if (amount > 0 && selectedAccountId) {
            handleAddContribution(goal.id, amount, selectedAccountId);
            setAmountToAdd('');
            setShowAddMoney(false);
        } else {
            alert("Veuillez sélectionner un compte et entrer un montant valide.");
        }
    };

    const ProjectionInfo: React.FC = () => {
        const remaining = goal.targetAmount - goal.currentAmount;
        if (remaining <= 0) {
            return <p className="text-center text-sm font-semibold text-success">Félicitations, objectif atteint !</p>;
        }

        const sortedContributions = goal.contributions.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (sortedContributions.length < 2) {
            return <p className="text-center text-sm text-gray-500 dark:text-gray-400">Ajoutez d'autres contributions pour une estimation.</p>;
        }

        const firstDate = new Date(sortedContributions[0].date);
        const lastDate = new Date(sortedContributions[sortedContributions.length - 1].date);
        const daysDiff = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (1000 * 3600 * 24));
        const totalContributed = sortedContributions.reduce((sum, c) => sum + c.amount, 0);
        const dailyRate = totalContributed / daysDiff;

        if (dailyRate <= 0) {
            return <p className="text-center text-sm text-gray-500 dark:text-gray-400">Rythme d'épargne insuffisant pour une projection.</p>;
        }

        const daysToGoal = Math.ceil(remaining / dailyRate);
        const completionDate = new Date();
        completionDate.setDate(completionDate.getDate() + daysToGoal);

        return <p className="text-center text-sm text-gray-600 dark:text-gray-300">À ce rythme, vous l'atteindrez vers le <span className="font-bold text-primary">{completionDate.toLocaleDateString('fr-FR')}</span>.</p>;
    };

    const CountdownInfo: React.FC = () => {
        if (!goal.deadline) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = new Date(goal.deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

        if (daysLeft < 0) {
            return <p className="text-center text-sm font-semibold text-danger">Date limite dépassée de {-daysLeft} jours.</p>;
        }
        return <p className="text-center text-sm text-gray-600 dark:text-gray-300"><span className="font-bold text-primary">{daysLeft}</span> jours restants.</p>;
    };

    const ContributionChart: React.FC = () => {
        if (goal.contributions.length === 0) return <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-sm text-gray-500">Aucune contribution</div>;

        const maxContribution = Math.max(...goal.contributions.map(c => c.amount), 1);

        return (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Historique des contributions</h4>
                <div className="flex items-end justify-center h-24 space-x-1">
                    {goal.contributions.slice(-30).map((c, index) => (
                        <div key={index} className="flex-1 bg-secondary rounded-t-sm hover:bg-secondary/80 transition-colors" style={{ height: `${(c.amount / maxContribution) * 100}%` }} title={`${c.amount.toLocaleString('fr-FR')} FCFA le ${new Date(c.date).toLocaleDateString()}`}></div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 bg-light dark:bg-gray-900 min-h-full">
            <button onClick={onBack} className="text-primary font-bold mb-4">&lt; Retour</button>
            <div className="flex flex-col items-center text-center">
                <div className="relative w-48 h-48 mb-4">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path className="text-gray-200 dark:text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" />
                        <path className="text-secondary" stroke="currentColor" strokeWidth="3.8" strokeLinecap="round" fill="none"
                            strokeDasharray={`${percentage}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <goal.icon className="w-12 h-12 text-secondary mb-1" />
                        <span className="text-3xl font-bold text-dark dark:text-light">{percentage}%</span>
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-dark dark:text-light">{goal.name}</h2>
                <p className="font-semibold text-dark dark:text-light text-lg mt-2">
                    {goal.currentAmount.toLocaleString('fr-FR')} / {goal.targetAmount.toLocaleString('fr-FR')} FCFA
                </p>
                <div className="my-3 space-y-1">
                    <ProjectionInfo />
                    <CountdownInfo />
                </div>
                <div className="w-full max-w-sm grid grid-cols-2 gap-3 text-center mb-4">
                    <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"><p className="text-xs text-gray-500 dark:text-gray-400">Niveau</p><p className="font-bold text-primary">{userLevel}</p></div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm flex items-center justify-center"><FireIcon className="w-5 h-5 text-orange-500 mr-1.5" /><p className="font-bold text-orange-500">{streak} jours</p></div>
                </div>
                <div className="w-full max-w-sm space-y-3 mb-6">
                    <button onClick={() => setShowAddMoney(true)} className="w-full bg-primary text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-700">Ajouter de l'argent</button>
                </div>
                <div className="w-full max-w-sm mt-4 text-left">
                    <ContributionChart />
                </div>
            </div>

            {showAddMoney && (
                <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-dark dark:text-light text-lg">Contribuer à "{goal.name}"</h3>
                            <button onClick={() => setShowAddMoney(false)}><XIcon className="w-6 h-6 text-gray-500 dark:text-gray-300" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Montant (FCFA)</label>
                                <input type="number" value={amountToAdd} onChange={e => setAmountToAdd(e.target.value)} className="mt-1 block w-full px-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-center text-lg font-semibold text-dark dark:text-light" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Depuis le compte</label>
                                <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} className="mt-1 block w-full px-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-dark dark:text-light">
                                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>)}
                                </select>
                            </div>
                        </div>
                        <button onClick={handleContributionSubmit} className="mt-6 w-full bg-primary text-white font-bold py-3 rounded-lg">Confirmer</button>
                    </div>
                </div>
            )}
        </div>
    )
}

const AddGoalForm: React.FC<{ onBack: () => void; }> = ({ onBack }) => {
    const { handleAddGoal, accounts } = useAppContext();
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [initialAmount, setInitialAmount] = useState('0');
    const [initialAccountId, setInitialAccountId] = useState(accounts[0]?.id || '');
    const [deadline, setDeadline] = useState('');
    const [category, setCategory] = useState<'Épargne Simple' | 'Projet Personnel' | 'Investissement'>('Projet Personnel');
    const [selectedIconName, setSelectedIconName] = useState<'Car' | 'House' | 'Shopping'>('Shopping');

    // iconMap imported from components/Icons
    const iconOptions: ('Car' | 'House' | 'Shopping')[] = ['Car', 'House', 'Shopping'];

    const handleSubmit = () => {
        if (!name || !targetAmount || parseFloat(targetAmount) <= 0) return;
        if (parseFloat(initialAmount) > 0 && !initialAccountId) {
            alert("Veuillez sélectionner un compte pour le dépôt initial.");
            return;
        }

        handleAddGoal({
            name,
            targetAmount: parseFloat(targetAmount),
            initialAmount: parseFloat(initialAmount) || 0,
            initialAccountId: parseFloat(initialAmount) > 0 ? initialAccountId : undefined,
            deadline: deadline || undefined,
            category,
            icon: iconMap[selectedIconName]
        });
        onBack();
    };

    return (
        <div className="p-4 bg-light dark:bg-gray-900 min-h-full">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="text-primary font-bold">&lt; Retour</button>
                <h1 className="text-xl font-bold text-dark dark:text-light mx-auto">Nouvel Objectif</h1>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nom de l'objectif</label>
                    <input type="text" placeholder="Ex: Voyage au Ghana" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-dark dark:text-light" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Montant Cible</label>
                        <input type="number" placeholder="500000" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="mt-1 block w-full px-3 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-dark dark:text-light" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dépôt Initial</label>
                        <input type="number" placeholder="0" value={initialAmount} onChange={e => setInitialAmount(e.target.value)} className="mt-1 block w-full px-3 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-dark dark:text-light" />
                    </div>
                </div>
                {parseFloat(initialAmount) > 0 && (
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Depuis le compte</label>
                        <select value={initialAccountId} onChange={e => setInitialAccountId(e.target.value)} className="mt-1 block w-full px-3 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-dark dark:text-light">
                            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                        </select>
                    </div>
                )}
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Catégorie</label>
                    <select value={category} onChange={e => setCategory(e.target.value as any)} className="mt-1 block w-full px-3 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-dark dark:text-light">
                        <option>Projet Personnel</option>
                        <option>Épargne Simple</option>
                        <option>Investissement</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date limite (Optionnel)</label>
                    <div className="relative mt-1">
                        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="block w-full px-3 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-dark dark:text-light pr-10" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Icône</label>
                    <div className="mt-2 flex space-x-3">{iconOptions.map(iconName => { const IconComponent = iconMap[iconName]; return (<button key={iconName} onClick={() => setSelectedIconName(iconName)} className={`w-16 h-16 rounded-lg flex items-center justify-center border-2 transition-colors ${selectedIconName === iconName ? 'bg-secondary/20 border-secondary' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`}><IconComponent className={`w-8 h-8 ${selectedIconName === iconName ? 'text-secondary' : 'text-gray-500 dark:text-gray-400'}`} /></button>); })}</div>
                </div>
                <button onClick={handleSubmit} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors mt-6">
                    Enregistrer l'objectif
                </button>
            </div>
        </div>
    );
};

const GoalsScreen: React.FC = () => {
    const { goals } = useAppContext();
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const { level: userLevel } = useMemo(() => {
        const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
        let level = "Débutant";
        if (totalSaved >= 1000000) level = "Maître";
        else if (totalSaved >= 500000) level = "Expert";
        else if (totalSaved >= 100000) level = "Intermédiaire";
        return { level };
    }, [goals]);

    if (selectedGoal) {
        return <GoalDetail
            goal={selectedGoal}
            onBack={() => setSelectedGoal(null)}
            userLevel={userLevel}
            streak={calculateStreak(selectedGoal.contributions)}
        />
    }

    if (showAddForm) {
        return <AddGoalForm onBack={() => setShowAddForm(false)} />
    }

    return (
        <div className="p-4 bg-light dark:bg-gray-900 min-h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-dark dark:text-light">Mes Objectifs</h1>
                <button onClick={() => setShowAddForm(true)} className="bg-primary text-white text-sm font-bold py-2 px-4 rounded-lg flex items-center">
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Ajouter
                </button>
            </div>
            <div className="space-y-4">
                {goals.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">Aucun objectif pour le moment.</p>}
                {goals.map(goal => {
                    const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                    return (
                        <div key={goal.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedGoal(goal)}>
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mr-4">
                                    <goal.icon className="w-6 h-6 text-secondary" />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="font-bold text-dark dark:text-light">{goal.name}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{Math.round(percentage)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div className="bg-secondary h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                    <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {goal.currentAmount.toLocaleString('fr-FR')} / {goal.targetAmount.toLocaleString('fr-FR')} FCFA
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GoalsScreen;