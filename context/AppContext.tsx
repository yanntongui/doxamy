import React, { createContext, useState, useCallback, useEffect, useContext, ReactNode, useMemo } from 'react';
import { type Transaction, type Goal, type BudgetPlan, type Contribution, type UserProfile, type Account, type FamilySpace, type DebtCreditItem, type DebtCreditContribution, type Checklist } from '../types';
import { CarIcon, HouseIcon, ShoppingBagIcon, iconMap } from '../components/Icons';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';

// Helper to map icon names to components for localStorage persistence
// iconMap imported from components/Icons

type CurrentView = {
    type: 'personal';
} | {
    type: 'family';
    spaceId: string;
    spaceName: string;
};

// Define the shape of the context data
interface AppContextType {
    onboardingComplete: boolean;
    handleOnboardingFinish: () => void;
    initialSetupComplete: boolean;
    handleSetupFinish: () => void;
    checklist: Checklist;
    userProfile: UserProfile | null;
    handleUpdateProfile: (updatedProfile: Partial<UserProfile>) => void;

    // Space Management
    familySpaces: FamilySpace[];
    createFamilySpace: (name: string) => void;
    leaveFamilySpace: (spaceId: string) => void;
    inviteToFamilySpace: (spaceId: string, email: string) => void;
    currentView: CurrentView;
    setCurrentView: (view: CurrentView) => void;

    // View-specific data (filtered)
    accounts: Account[];
    transactions: Transaction[];
    goals: Goal[];
    savedBudgets: BudgetPlan[];
    debtCreditItems: DebtCreditItem[];

    // Global handlers
    handleAddAccount: (newAccount: Omit<Account, 'id' | 'familySpaceId'>) => Promise<void>;
    handleDeleteAccount: (accountId: string) => Promise<void>;
    handleAddTransaction: (newTransaction: Omit<Transaction, 'id'>) => Promise<void>;
    handleDeleteTransaction: (transactionId: string) => Promise<void>;
    handleUpdateTransaction: (updatedTransaction: Omit<Transaction, 'debtCreditId'> & { id: string; debtCreditId?: string }) => Promise<void>;
    handleAddGoal: (newGoalData: Omit<Goal, 'id' | 'currentAmount' | 'contributions'> & { initialAmount: number, initialAccountId?: string }) => Promise<void>;
    handleAddContribution: (goalId: string, amount: number, accountId: string) => Promise<void>;
    handleSaveBudget: (budgetToSave: BudgetPlan) => void; // Keeping sync for now as it's not implemented
    handleDeleteBudget: (budgetId: string) => void;
    handleAddDebtCreditItem: (newItem: Omit<DebtCreditItem, 'id' | 'familySpaceId' | 'contributions'>) => void;
    handleDeleteDebtCreditItem: (itemId: string) => void;
    handleAddRepayment: (itemId: string, amount: number, accountId: string) => void;
    handleLogout: () => Promise<void>;
    loading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const initialChecklist: Checklist = {
    addedAccount: false,
    addedTransaction: false,
    createdBudget: false,
    setGoal: false,
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // --- GLOBAL STATE ---
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const [onboardingComplete, setOnboardingComplete] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // Data States
    const [allAccounts, setAllAccounts] = useState<Account[]>([]);
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [allBudgets, setAllBudgets] = useState<BudgetPlan[]>([]);
    const [familySpaces, setFamilySpaces] = useState<FamilySpace[]>([]); // Keeping local/empty for now as schema doesn't support it yet
    const [allDebtCreditItems, setAllDebtCreditItems] = useState<DebtCreditItem[]>([]);

    const [initialSetupComplete, setInitialSetupComplete] = useState(false);
    const [checklist, setChecklist] = useState<Checklist>(initialChecklist);
    const [currentView, setCurrentView] = useState<CurrentView>({ type: 'personal' });

    // --- SUPABASE AUTH & DATA FETCHING ---
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchData();
            else setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) fetchData();
            else {
                // Reset state on logout
                setAllAccounts([]);
                setAllTransactions([]);
                setGoals([]);
                setUserProfile(null);
                setOnboardingComplete(false);
                setInitialSetupComplete(false);
                setChecklist(initialChecklist);
                setCurrentView({ type: 'personal' });
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Profile
            const { data: profile } = await supabase.from('profiles').select('*').single();
            if (profile) {
                setUserProfile(profile);
                setOnboardingComplete(true);
            }

            // Accounts
            const { data: accs } = await supabase.from('accounts').select('*');
            if (accs) setAllAccounts(accs);

            // Transactions
            const { data: txs } = await supabase.from('transactions').select('*');
            if (txs) setAllTransactions(txs);

            // Goals
            const { data: gls } = await supabase.from('goals').select('*');
            if (gls) {
                // Need to fetch contributions for each goal or join them
                // For simplicity, we'll just set goals and handle contributions separately or assume they are joined if we change query
                // The current schema has a separate table. We should probably fetch them.
                // Let's fetch goals and then contributions.
                const { data: contribs } = await supabase.from('goal_contributions').select('*');

                const goalsWithContribs = gls.map(g => ({
                    ...g,
                    // Map icon string to component if needed, but we refactored to use string key in UI mostly
                    // The UI expects 'icon' to be a string key now based on my refactor? 
                    // Wait, the UI uses `iconMap[goal.icon]` so goal.icon should be the string key.
                    contributions: contribs?.filter(c => c.goal_id === g.id) || []
                }));
                setGoals(goalsWithContribs);
            }

            // Initial Setup Check
            if (accs && accs.length > 0) setInitialSetupComplete(true);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- DERIVED (FILTERED) STATE ---
    const accounts = useMemo(() => {
        if (currentView.type === 'personal') return allAccounts.filter(acc => !acc.familySpaceId);
        return allAccounts.filter(acc => acc.familySpaceId === currentView.spaceId);
    }, [allAccounts, currentView]);

    const savedBudgets = useMemo(() => {
        if (currentView.type === 'personal') return allBudgets.filter(b => !b.familySpaceId);
        return allBudgets.filter(b => b.familySpaceId === currentView.spaceId);
    }, [allBudgets, currentView]);

    const transactions = useMemo(() => {
        const visibleAccountIds = new Set(accounts.map(acc => acc.id));
        return allTransactions.filter(tx => visibleAccountIds.has(tx.accountId));
    }, [allTransactions, accounts]);

    const debtCreditItems = useMemo(() => {
        if (currentView.type === 'personal') return allDebtCreditItems.filter(item => !item.familySpaceId);
        return allDebtCreditItems.filter(item => item.familySpaceId === currentView.spaceId);
    }, [allDebtCreditItems, currentView]);


    // --- HANDLERS ---
    const handleOnboardingFinish = useCallback(() => setOnboardingComplete(true), []);
    const handleSetupFinish = useCallback(() => setInitialSetupComplete(true), []);

    const handleUpdateProfile = useCallback(async (updatedProfile: Partial<UserProfile>) => {
        if (!session?.user) return;
        const { error } = await supabase.from('profiles').update(updatedProfile).eq('id', session.user.id);
        if (!error) setUserProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
    }, [session]);

    const createFamilySpace = useCallback((name: string) => {
        // TODO: Implement Supabase Family Spaces
        console.warn("Family Spaces not yet implemented in Supabase backend");
    }, []);

    const inviteToFamilySpace = useCallback((spaceId: string, email: string) => {
        // TODO
    }, []);

    const leaveFamilySpace = useCallback((spaceId: string) => {
        // TODO
        setCurrentView({ type: 'personal' });
    }, []);

    const handleLogout = useCallback(async () => {
        await supabase.auth.signOut();
        // State reset handled by onAuthStateChange
    }, []);

    const handleAddAccount = useCallback(async (newAccount: Omit<Account, 'id' | 'familySpaceId'>) => {
        if (!session?.user) return;
        const accountData = { ...newAccount, user_id: session.user.id };
        const { data, error } = await supabase.from('accounts').insert(accountData).select().single();

        if (data && !error) {
            setAllAccounts(prev => [...prev, data]);
            setChecklist(prev => ({ ...prev, addedAccount: true }));
        }
    }, [session]);

    const handleDeleteAccount = useCallback(async (accountId: string) => {
        if (window.confirm("Êtes-vous sûr ?")) {
            const { error } = await supabase.from('accounts').delete().eq('id', accountId);
            if (!error) {
                setAllAccounts(prev => prev.filter(acc => acc.id !== accountId));
                setAllTransactions(prev => prev.filter(tx => tx.accountId !== accountId));
            }
        }
    }, []);

    const handleAddTransaction = useCallback(async (newTransaction: Omit<Transaction, 'id'>) => {
        if (!session?.user) return;
        const txData = { ...newTransaction, user_id: session.user.id };
        const { data, error } = await supabase.from('transactions').insert(txData).select().single();

        if (data && !error) {
            setAllTransactions(prev => [data, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setChecklist(prev => ({ ...prev, addedTransaction: true }));
        }
    }, [session]);

    const handleDeleteTransaction = useCallback(async (transactionId: string) => {
        const { error } = await supabase.from('transactions').delete().eq('id', transactionId);
        if (!error) setAllTransactions(prev => prev.filter(tx => tx.id !== transactionId));
    }, []);

    const handleUpdateTransaction = useCallback(async (updatedTransaction: Omit<Transaction, 'debtCreditId'> & { id: string; debtCreditId?: string }) => {
        const { error } = await supabase.from('transactions').update(updatedTransaction).eq('id', updatedTransaction.id);
        if (!error) setAllTransactions(prev => prev.map(tx => (tx.id === updatedTransaction.id ? { ...tx, ...updatedTransaction } as Transaction : tx)));
    }, []);

    const handleAddGoal = useCallback(async (newGoalData: Omit<Goal, 'id' | 'currentAmount' | 'contributions'> & { initialAmount: number, initialAccountId?: string }) => {
        if (!session?.user) return;

        // 1. Create Goal
        const goalData = {
            user_id: session.user.id,
            name: newGoalData.name,
            target_amount: newGoalData.targetAmount,
            deadline: newGoalData.deadline,
            category: newGoalData.category,
            icon: newGoalData.icon,
            current_amount: newGoalData.initialAmount
        };

        const { data: goal, error } = await supabase.from('goals').insert(goalData).select().single();

        if (goal && !error) {
            // 2. Add Initial Contribution if any
            if (newGoalData.initialAmount > 0) {
                await supabase.from('goal_contributions').insert({
                    goal_id: goal.id,
                    amount: newGoalData.initialAmount,
                    date: new Date().toISOString()
                });
            }

            // 3. Add Transaction if account specified
            if (newGoalData.initialAmount > 0 && newGoalData.initialAccountId) {
                const transactionData = {
                    user_id: session.user.id,
                    account_id: newGoalData.initialAccountId,
                    date: new Date().toISOString(), // Use ISO for DB
                    category: 'Épargne',
                    description: `Dépôt initial: ${goal.name}`,
                    amount: newGoalData.initialAmount,
                    type: 'expense',
                    frequency: 'ponctuel',
                    // goalId: goal.id // Schema doesn't have goalId in transactions, but we can add it or ignore
                };
                await supabase.from('transactions').insert(transactionData);
            }

            // Refresh goals to get the new state correctly
            fetchData();
            setChecklist(prev => ({ ...prev, setGoal: true }));
        }
    }, [session, fetchData]);

    const handleAddContribution = useCallback(async (goalId: string, amount: number, accountId: string) => {
        if (!session?.user) return;

        // 1. Add Contribution
        await supabase.from('goal_contributions').insert({
            goal_id: goalId,
            amount: amount,
            date: new Date().toISOString()
        });

        // 2. Update Goal Current Amount
        // Ideally trigger or separate update, but for now manual update
        const goal = goals.find(g => g.id === goalId);
        if (goal) {
            await supabase.from('goals').update({ current_amount: goal.currentAmount + amount }).eq('id', goalId);
        }

        // 3. Add Transaction
        const transactionData = {
            user_id: session.user.id,
            account_id: accountId,
            date: new Date().toISOString(),
            category: 'Épargne',
            description: `Contribution: ${goal?.name}`,
            amount: amount,
            type: 'expense',
            frequency: 'ponctuel'
        };
        await supabase.from('transactions').insert(transactionData);

        fetchData();
    }, [session, goals, fetchData]);

    const handleSaveBudget = useCallback((budgetToSave: BudgetPlan) => {
        // TODO: Implement Supabase Budgets
        console.warn("Budgets not yet implemented in Supabase backend");
        setAllBudgets(prev => [...prev, budgetToSave]); // Local fallback
    }, []);

    const handleDeleteBudget = useCallback((budgetId: string) => setAllBudgets(prevBudgets => prevBudgets.filter(b => b.id !== budgetId)), []);

    const handleAddDebtCreditItem = useCallback((newItem: Omit<DebtCreditItem, 'id' | 'familySpaceId' | 'contributions'>) => {
        // TODO: Implement Supabase Debt/Credit
        console.warn("Debt/Credit not yet implemented in Supabase backend");
        setAllDebtCreditItems(prev => [...prev, { ...newItem, id: Date.now().toString(), contributions: [], familySpaceId: undefined }]);
    }, []);

    const handleDeleteDebtCreditItem = useCallback((itemId: string) => {
        setAllDebtCreditItems(prev => prev.filter(item => item.id !== itemId));
    }, []);

    const handleAddRepayment = useCallback((itemId: string, amount: number, accountId: string) => {
        // TODO
    }, []);

    const value: AppContextType = {
        onboardingComplete, handleOnboardingFinish,
        initialSetupComplete, handleSetupFinish,
        checklist,
        userProfile, handleUpdateProfile,
        familySpaces, createFamilySpace, leaveFamilySpace, inviteToFamilySpace,
        currentView, setCurrentView,
        accounts, transactions, goals, savedBudgets, debtCreditItems,
        handleAddAccount, handleDeleteAccount,
        handleAddTransaction, handleDeleteTransaction, handleUpdateTransaction,
        handleAddGoal, handleAddContribution,
        handleSaveBudget, handleDeleteBudget,
        handleAddDebtCreditItem, handleDeleteDebtCreditItem, handleAddRepayment,
        handleLogout,
        loading
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used within an AppProvider');
    return context;
};