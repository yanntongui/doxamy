import React, { useState, useMemo, useEffect, useRef } from 'react';
import { type Transaction } from '../types';
import { CameraIcon, MicIcon, ShoppingBagIcon, HouseIcon, CarIcon, FilterIcon, RepeatIcon, DownloadIcon, XIcon, TrashIcon, CalendarIcon, SwitchHorizontalIcon, ScaleIcon, PiggyBankIcon, SparklesIcon } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { categorizeTransaction } from "../services/aiService";

const categoryIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
    'Alimentation': ShoppingBagIcon,
    'Transport': CarIcon,
    'Logement': HouseIcon,
    'Salaire': HouseIcon,
    'Loyer / Remboursement immo': HouseIcon,
    'Alimentation (courses)': ShoppingBagIcon,
    'Transports': CarIcon,
    'Remboursement Dette': ScaleIcon,
    'Rentrée Créance': ScaleIcon,
    'Épargne': PiggyBankIcon,
};

// --- Sub-Components ---
const TransactionDetailModal: React.FC<{
    transaction: Transaction;
    onClose: () => void;
    onDelete: (id: string) => void;
    onEdit: () => void;
}> = ({ transaction, onClose, onDelete, onEdit }) => {
    const { accounts, debtCreditItems, goals } = useAppContext();
    const Icon = transaction.type === 'transfer' ? SwitchHorizontalIcon : categoryIcons[transaction.category] || ShoppingBagIcon;

    const sourceAccount = accounts.find(acc => acc.id === transaction.accountId);
    const destAccount = accounts.find(acc => acc.id === transaction.destinationAccountId);
    const debtCreditLink = transaction.debtCreditId ? debtCreditItems.find(item => item.id === transaction.debtCreditId) : null;
    const goalLink = transaction.goalId ? goals.find(goal => goal.id === transaction.goalId) : null;


    return (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-dark dark:text-light text-lg">Détail de la Transaction</h3>
                    <button onClick={onClose}><XIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 hover:text-dark dark:hover:text-light" /></button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                            <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="font-bold text-dark dark:text-light text-xl">{transaction.description}</p>
                            <p className="text-gray-500 dark:text-gray-400">{transaction.type === 'transfer' ? 'Transfert' : transaction.category}</p>
                        </div>
                    </div>

                    <div className="text-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className={`text-3xl font-bold ${transaction.type === 'income' ? 'text-success' : transaction.type === 'expense' ? 'text-danger' : 'text-primary'}`}>
                            {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''} {transaction.amount.toLocaleString('fr-FR')} FCFA
                        </p>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2 border-t dark:border-gray-700 pt-3">
                        <div className="flex justify-between">
                            <span className="font-semibold">Date:</span>
                            <span>{transaction.date}</span>
                        </div>
                        {transaction.type === 'transfer' ? (
                            <>
                                <div className="flex justify-between"><span className="font-semibold">De:</span><span>{sourceAccount?.name}</span></div>
                                <div className="flex justify-between"><span className="font-semibold">À:</span><span>{destAccount?.name}</span></div>
                                {transaction.transferFee && <div className="flex justify-between"><span className="font-semibold">Frais:</span><span>{transaction.transferFee.toLocaleString('fr-FR')} FCFA</span></div>}
                            </>
                        ) : (
                            <div className="flex justify-between"><span className="font-semibold">Compte:</span><span>{sourceAccount?.name}</span></div>
                        )}
                        <div className="flex justify-between">
                            <span className="font-semibold">Fréquence:</span>
                            <span>{transaction.frequency.charAt(0).toUpperCase() + transaction.frequency.slice(1)}</span>
                        </div>
                        {transaction.attachmentName && (
                            <div className="flex justify-between">
                                <span className="font-semibold">Pièce jointe:</span>
                                <span className="truncate max-w-[60%]">{transaction.attachmentName}</span>
                            </div>
                        )}
                        {debtCreditLink && (
                            <div className="flex justify-between">
                                <span className="font-semibold">Liée à:</span>
                                <span className="truncate max-w-[60%] flex items-center">
                                    <ScaleIcon className="w-4 h-4 mr-1 text-gray-400" />
                                    {debtCreditLink.name}
                                </span>
                            </div>
                        )}
                        {goalLink && (
                            <div className="flex justify-between">
                                <span className="font-semibold">Liée à:</span>
                                <span className="truncate max-w-[60%] flex items-center">
                                    <PiggyBankIcon className="w-4 h-4 mr-1 text-gray-400" />
                                    {goalLink.name}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex space-x-3">
                    <button
                        onClick={() => onDelete(transaction.id)}
                        className="flex-1 bg-danger/10 text-danger font-bold py-3 rounded-lg hover:bg-danger/20 transition-colors"
                    >
                        Supprimer
                    </button>
                    <button
                        onClick={onEdit}
                        className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                        Modifier
                    </button>
                </div>
            </div>
        </div>
    );
};


interface AddTransactionFormProps {
    onBack: () => void;
    transactionToEdit?: Transaction | null;
}

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({ onBack, transactionToEdit }) => {
    const { handleAddTransaction, handleUpdateTransaction, savedBudgets, accounts } = useAppContext();
    const isEditing = !!transactionToEdit;

    const expenseCategories = useMemo(() => {
        if (savedBudgets.length === 0) {
            return ['Alimentation', 'Transport', 'Logement', 'Loisirs', 'Épargne', 'Autre'];
        }
        const latestBudget = savedBudgets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        const categories = latestBudget.sections.flatMap(section => section.lines.map(line => line.category));
        return [...new Set(categories), 'Épargne', 'Autre']; // Unique categories
    }, [savedBudgets]);

    const incomeCategories = useMemo(() => ['Salaire', 'Revenus de Placement', 'Revenus Locatifs', 'Remboursement', 'Cadeau', 'Autre'], []);

    const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense');
    const availableCategories = type === 'income' ? incomeCategories : expenseCategories;

    const [amount, setAmount] = useState('');
    const [accountId, setAccountId] = useState(accounts[0]?.id || '');
    const [destinationAccountId, setDestinationAccountId] = useState(accounts[1]?.id || '');
    const [category, setCategory] = useState(availableCategories[0] || '');
    const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
    const [description, setDescription] = useState('');
    const [frequency, setFrequency] = useState<'ponctuel' | 'hebdomadaire' | 'mensuel' | 'annuel'>('ponctuel');
    const [transferFee, setTransferFee] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [existingAttachmentName, setExistingAttachmentName] = useState<string | undefined>(undefined);
    const [isListening, setIsListening] = useState(false);
    const [isCategorizing, setIsCategorizing] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (transactionToEdit) {
            setType(transactionToEdit.type);
            setAmount(transactionToEdit.amount.toString());
            setAccountId(transactionToEdit.accountId);
            setDestinationAccountId(transactionToEdit.destinationAccountId || '');
            setCategory(transactionToEdit.category);
            const [day, month, year] = transactionToEdit.date.split('/');
            setDate(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
            setDescription(transactionToEdit.description);
            setFrequency(transactionToEdit.frequency);
            setTransferFee(transactionToEdit.transferFee?.toString() || '');
            setAttachment(null);
            setExistingAttachmentName(transactionToEdit.attachmentName);
        } else {
            setAttachment(null);
            setExistingAttachmentName(undefined);
        }
    }, [transactionToEdit]);

    useEffect(() => {
        if (!isEditing && type !== 'transfer') {
            setCategory(availableCategories[0] || '');
        }
    }, [type, availableCategories, isEditing]);


    const handleSubmit = () => {
        if (!amount || !description || !accountId || (type !== 'transfer' && !category)) {
            alert("Veuillez remplir tous les champs obligatoires.");
            return;
        }
        if (type === 'transfer' && (!destinationAccountId || accountId === destinationAccountId)) {
            alert("Pour un transfert, veuillez sélectionner un compte de destination différent du compte source.");
            return;
        }

        const transactionData = {
            accountId,
            amount: parseFloat(amount),
            category: type === 'transfer' ? 'Transfert' : category,
            date: new Date(date).toLocaleDateString('fr-FR'),
            description,
            type,
            frequency,
            destinationAccountId: type === 'transfer' ? destinationAccountId : undefined,
            transferFee: type === 'transfer' ? parseFloat(transferFee) || 0 : undefined,
            attachmentName: attachment ? attachment.name : existingAttachmentName,
        };

        if (isEditing && transactionToEdit) {
            handleUpdateTransaction({ ...transactionData, id: transactionToEdit.id, debtCreditId: transactionToEdit.debtCreditId, goalId: transactionToEdit.goalId });
        } else {
            handleAddTransaction(transactionData);
        }
        onBack();
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAttachment(e.target.files[0]);
            setExistingAttachmentName(undefined); // New file selection clears old one
        }
    };

    const handleAttachmentClick = () => {
        fileInputRef.current?.click();
    };

    const handleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Désolé, la reconnaissance vocale n'est pas supportée par votre navigateur.");
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'fr-FR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognitionRef.current = recognition;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setDescription(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const handleAutoCategorize = async () => {
        if (!description) {
            alert("Veuillez d'abord entrer une description.");
            return;
        }
        setIsCategorizing(true);
        const suggestedCategory = await categorizeTransaction(description);
        setIsCategorizing(false);

        if (suggestedCategory) {
            // Check if category exists in available list, if not default to Autre or add it?
            // For now, let's try to match it or default to 'Autre' if completely unknown
            // But the prompt asks for specific categories.
            if (availableCategories.includes(suggestedCategory)) {
                setCategory(suggestedCategory);
            } else {
                // Try to find a close match or just set it (if select allows custom values? No it doesn't usually)
                // If the AI returns something valid from our list, great.
                // If not, we might want to fallback.
                // The prompt was instructed to return specific categories.
                // Let's assume it returns one of them.
                // If the returned category is not in the current list (e.g. income vs expense), we might have an issue.
                // But we only show this button for expenses usually? Or both?
                // Let's check if it's in availableCategories.
                const match = availableCategories.find(c => c.toLowerCase() === suggestedCategory.toLowerCase());
                if (match) {
                    setCategory(match);
                } else {
                    alert(`Catégorie suggérée : ${suggestedCategory} (Non disponible dans la liste actuelle)`);
                }
            }
        } else {
            alert("Impossible de catégoriser automatiquement.");
        }
    };

    const attachmentDisplayName = attachment?.name || existingAttachmentName;

    return (
        <div className="p-4 bg-light dark:bg-gray-900 min-h-full">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="text-primary font-bold">&lt; Retour</button>
                <h1 className="text-xl font-bold text-dark dark:text-light mx-auto">{isEditing ? 'Modifier la transaction' : 'Ajouter une transaction'}</h1>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-200 dark:bg-gray-800 p-1 mb-4">
                    <button onClick={() => setType('expense')} className={`py-2 rounded-md font-semibold transition-all ${type === 'expense' ? 'bg-white dark:bg-gray-700 text-danger shadow' : 'text-gray-600 dark:text-gray-400'}`}>Dépense</button>
                    <button onClick={() => setType('income')} className={`py-2 rounded-md font-semibold transition-all ${type === 'income' ? 'bg-white dark:bg-gray-700 text-success shadow' : 'text-gray-600 dark:text-gray-400'}`}>Revenu</button>
                    <button onClick={() => setType('transfer')} className={`py-2 rounded-md font-semibold transition-all ${type === 'transfer' ? 'bg-white dark:bg-gray-700 text-primary shadow' : 'text-gray-600 dark:text-gray-400'}`}>Transfert</button>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Montant (FCFA)</label>
                    <input type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 text-center text-3xl font-bold w-full p-2 bg-white dark:bg-gray-800 border-b-2 border-primary focus:outline-none text-dark dark:text-light" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                    <div className="relative mt-1">
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="block w-full px-3 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-dark dark:text-light pr-10" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {type === 'transfer' ? (
                    <>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Compte Source</label>
                            <select value={accountId} onChange={e => setAccountId(e.target.value)} className="mt-1 block w-full px-3 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-dark dark:text-light">
                                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Compte Destination</label>
                            <select value={destinationAccountId} onChange={e => setDestinationAccountId(e.target.value)} className="mt-1 block w-full px-3 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-dark dark:text-light">
                                <option value="" disabled>Sélectionner un compte</option>
                                {accounts.filter(acc => acc.id !== accountId).map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Frais de transfert (Optionnel)</label>
                            <input type="number" placeholder="Ex: 100" value={transferFee} onChange={e => setTransferFee(e.target.value)} className="mt-1 block w-full px-3 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-dark dark:text-light" />
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Catégorie</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full px-3 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-dark dark:text-light">
                                {availableCategories.map(cat => <option key={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Compte</label>
                            <select value={accountId} onChange={e => setAccountId(e.target.value)} className="mt-1 block w-full px-3 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-dark dark:text-light">
                                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                            </select>
                        </div>
                    </>
                )}

                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <div className="flex space-x-2 mt-1">
                        <input type="text" placeholder={type === 'transfer' ? "Ex: Transfert vers Wave" : "Ex: Courses du weekend"} value={description} onChange={e => setDescription(e.target.value)} className="block w-full px-3 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-dark dark:text-light" />
                        <button
                            onClick={handleAutoCategorize}
                            disabled={isCategorizing || !description}
                            className={`p-3 rounded-md transition-colors ${isCategorizing ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                            title="Auto-catégoriser avec IA"
                        >
                            <SparklesIcon className={`w-5 h-5 ${isCategorizing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fréquence</label>
                    <select value={frequency} onChange={e => setFrequency(e.target.value as any)} className="mt-1 block w-full px-3 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-dark dark:text-light">
                        <option value="ponctuel">Ponctuel</option>
                        <option value="hebdomadaire">Hebdomadaire</option>
                        <option value="mensuel">Mensuel</option>
                        <option value="annuel">Annuel</option>
                    </select>
                </div>
                <div className="flex space-x-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,application/pdf"
                    />
                    <button
                        onClick={handleAttachmentClick}
                        className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg transition-colors ${attachmentDisplayName ? 'bg-secondary/20 text-secondary' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        <CameraIcon className="w-5 h-5" />
                        <span>Pièce jointe</span>
                    </button>
                    <button onClick={handleVoiceInput} className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg transition-colors ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                        <MicIcon className="w-5 h-5" />
                        <span>{isListening ? 'Écoute...' : 'Voix'}</span>
                    </button>
                </div>
                {attachmentDisplayName && (
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 -mt-2 truncate" title={attachmentDisplayName}>
                        Fichier: {attachmentDisplayName}
                    </p>
                )}
                <button onClick={handleSubmit} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                    Enregistrer
                </button>
            </div>
        </div>
    );
};

interface ExpensesScreenProps {
    showAddForm: boolean;
    setShowAddForm: (show: boolean) => void;
}

const ExpensesScreen: React.FC<ExpensesScreenProps> = ({ showAddForm, setShowAddForm }) => {
    const { transactions, savedBudgets, handleDeleteTransaction, accounts, debtCreditItems, goals } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);

    // Filter states
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterMinAmount, setFilterMinAmount] = useState('');
    const [filterMaxAmount, setFilterMaxAmount] = useState('');

    const availableCategories = useMemo(() => {
        if (savedBudgets.length === 0) return ['Alimentation', 'Transport', 'Logement', 'Loisirs', 'Salaire'];
        const latestBudget = savedBudgets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        const categories = latestBudget.sections.flatMap(section => section.lines.map(line => line.category));
        return ['', ...Array.from(new Set(categories))]; // Add empty for "All"
    }, [savedBudgets]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const searchMatch = !searchTerm ||
                tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.category.toLowerCase().includes(searchTerm.toLowerCase());

            const categoryMatch = !filterCategory || tx.category === filterCategory;

            const txDateParts = tx.date.split('/');
            const txDate = new Date(Number(txDateParts[2]), Number(txDateParts[1]) - 1, Number(txDateParts[0]));

            const startDate = filterStartDate ? new Date(filterStartDate) : null;
            if (startDate) startDate.setHours(0, 0, 0, 0);
            const endDate = filterEndDate ? new Date(filterEndDate) : null;
            if (endDate) endDate.setHours(23, 59, 59, 999);

            const dateMatch = (!startDate || txDate >= startDate) && (!endDate || txDate <= endDate);

            const minAmount = filterMinAmount ? parseFloat(filterMinAmount) : null;
            const maxAmount = filterMaxAmount ? parseFloat(filterMaxAmount) : null;
            const amountMatch = (minAmount === null || tx.amount >= minAmount) && (maxAmount === null || tx.amount <= maxAmount);

            return searchMatch && categoryMatch && dateMatch && amountMatch;
        });
    }, [transactions, searchTerm, filterCategory, filterStartDate, filterEndDate, filterMinAmount, filterMaxAmount]);

    const resetFilters = () => {
        setFilterCategory('');
        setFilterStartDate('');
        setFilterEndDate('');
        setFilterMinAmount('');
        setFilterMaxAmount('');
        setShowFilters(false);
    };

    const handleExportCSV = () => {
        const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Frequency', 'Account', 'Destination Account', 'Transfer Fee', 'Attachment'];
        const csvRows = [headers.join(',')];

        filteredTransactions.forEach(tx => {
            const sourceAccount = accounts.find(acc => acc.id === tx.accountId);
            const destAccount = accounts.find(acc => acc.id === tx.destinationAccountId);
            const row = [
                tx.date,
                `"${tx.description.replace(/"/g, '""')}"`,
                tx.category,
                tx.type,
                tx.amount,
                tx.frequency,
                sourceAccount ? sourceAccount.name : 'N/A',
                tx.type === 'transfer' ? (destAccount ? destAccount.name : 'N/A') : '',
                tx.type === 'transfer' ? (tx.transferFee || 0) : '',
                tx.attachmentName || ''
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `doxamy_transactions_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const [period, setPeriod] = useState<'current' | 'last'>('current');

    const summaryData = useMemo(() => {
        const now = new Date();
        const targetDate = new Date(now.getFullYear(), period === 'current' ? now.getMonth() : now.getMonth() - 1, 1);
        const targetYear = targetDate.getFullYear();
        const targetMonth = targetDate.getMonth();

        const monthTransactions = transactions.filter(tx => {
            const [day, month, year] = tx.date.split('/').map(Number);
            return year === targetYear && (month - 1) === targetMonth;
        });

        const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = monthTransactions.reduce((sum, t) => {
            if (t.type === 'expense') sum += t.amount;
            if (t.type === 'transfer' && t.transferFee) sum += t.transferFee;
            return sum;
        }, 0);

        return { income, expenses, balance: income - expenses };
    }, [transactions, period]);

    const handleDelete = (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette transaction ? Cette action est irréversible.")) {
            handleDeleteTransaction(id);
            setSelectedTx(null);
        }
    };

    const handleRequestEdit = (tx: Transaction) => {
        setSelectedTx(null);
        setEditingTx(tx);
    };

    const handleCloseForm = () => {
        setShowAddForm(false);
        setEditingTx(null);
    };

    if (showAddForm || editingTx) {
        return <AddTransactionForm onBack={handleCloseForm} transactionToEdit={editingTx} />;
    }

    return (
        <div className="p-4 bg-light dark:bg-gray-900 min-h-full">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-4">
                <div className="flex justify-between text-center">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Revenus</p>
                        <p className="font-bold text-success text-lg">{summaryData.income.toLocaleString('fr-FR')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Dépenses</p>
                        <p className="font-bold text-danger text-lg">-{summaryData.expenses.toLocaleString('fr-FR')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Solde</p>
                        <p className="font-bold text-primary text-lg">{summaryData.balance.toLocaleString('fr-FR')}</p>
                    </div>
                </div>
                <div className="flex justify-center space-x-2 mt-3 pt-3 border-t dark:border-gray-700">
                    <button onClick={() => setPeriod('current')} className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm transition-colors ${period === 'current' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>Ce mois-ci</button>
                    <button onClick={() => setPeriod('last')} className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm transition-colors ${period === 'last' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>Mois dernier</button>
                </div>
            </div>

            <div className="flex space-x-2 mb-4">
                <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-dark dark:text-light"
                />
                <button onClick={() => setShowFilters(!showFilters)} className={`p-2 bg-white dark:bg-gray-800 border rounded-lg transition-colors ${showFilters ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-600'}`}>
                    <FilterIcon className={`w-5 h-5 ${showFilters ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`} />
                </button>
            </div>

            {showFilters && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Catégorie</label>
                            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-dark dark:text-light">
                                {availableCategories.map(cat => <option key={cat} value={cat}>{cat || 'Toutes'}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Date de début</label>
                                <div className="relative mt-1">
                                    <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-dark dark:text-light pr-10" />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Date de fin</label>
                                <div className="relative mt-1">
                                    <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-dark dark:text-light pr-10" />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Montant Min</label>
                                <input type="number" placeholder="ex: 500" value={filterMinAmount} onChange={e => setFilterMinAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-dark dark:text-light" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Montant Max</label>
                                <input type="number" placeholder="ex: 10000" value={filterMaxAmount} onChange={e => setFilterMaxAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-dark dark:text-light" />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button onClick={resetFilters} className="px-4 py-2 text-sm font-semibold bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg">Réinitialiser les filtres</button>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-dark dark:text-light">Transactions</h2>
                <button onClick={handleExportCSV} className="text-sm text-primary font-semibold flex items-center space-x-1 hover:underline">
                    <DownloadIcon className="w-4 h-4" />
                    <span>Exporter</span>
                </button>
            </div>

            <div className="space-y-3">
                {filteredTransactions.map(tx => {
                    const Icon = tx.type === 'transfer' ? SwitchHorizontalIcon : categoryIcons[tx.category] || ShoppingBagIcon;
                    const account = accounts.find(acc => acc.id === tx.accountId);
                    const destAccount = accounts.find(acc => acc.id === tx.destinationAccountId);
                    const debtCreditLink = tx.debtCreditId ? debtCreditItems.find(item => item.id === tx.debtCreditId) : null;
                    const goalLink = tx.goalId ? goals.find(g => g.id === tx.goalId) : null;

                    let subtitle = `${tx.date} - ${account?.name || 'Compte inconnu'}`;
                    if (tx.type === 'transfer') {
                        subtitle = `${tx.date} | De: ${account?.name} | À: ${destAccount?.name}`;
                    }

                    return (
                        <div key={tx.id} className="w-full bg-white dark:bg-gray-800 p-3 rounded-lg flex items-center text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <div onClick={() => setSelectedTx(tx)} className="flex-grow flex items-center cursor-pointer">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                                    <Icon className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-grow">
                                    <div className="font-medium text-dark dark:text-light flex items-center flex-wrap">
                                        <span>{tx.description}</span>
                                        {tx.frequency !== 'ponctuel' && <RepeatIcon className="w-4 h-4 text-blue-400 ml-2" title={`Transaction ${tx.frequency}`} />}
                                        {debtCreditLink && (
                                            <span className="ml-2 mt-1 text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full flex items-center text-gray-600 dark:text-gray-300" title={`Liée à: ${debtCreditLink.name}`}>
                                                <ScaleIcon className="w-3 h-3 mr-1" />
                                                {debtCreditLink.name}
                                            </span>
                                        )}
                                        {goalLink && (
                                            <span className="ml-2 mt-1 text-xs bg-secondary/20 px-2 py-0.5 rounded-full flex items-center text-secondary-700 dark:text-secondary-300" title={`Objectif: ${goalLink.name}`}>
                                                <PiggyBankIcon className="w-3 h-3 mr-1" />
                                                {goalLink.name}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
                                </div>
                                <p className={`font-bold pr-4 ${tx.type === 'income' ? 'text-success' : tx.type === 'expense' ? 'text-danger' : 'text-primary'}`}>
                                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''} {tx.amount.toLocaleString('fr-FR')} FCFA
                                </p>
                            </div>
                            <button onClick={() => handleDelete(tx.id)} className="text-danger p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full ml-2">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    );
                })}
            </div>

            {selectedTx && (
                <TransactionDetailModal
                    transaction={selectedTx}
                    onClose={() => setSelectedTx(null)}
                    onDelete={handleDelete}
                    onEdit={() => handleRequestEdit(selectedTx)}
                />
            )}
        </div>
    );
};

export default ExpensesScreen;