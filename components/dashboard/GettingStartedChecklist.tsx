import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { type NavItem } from '../../types';
import { CheckCircleIcon, XIcon } from '../Icons';

interface GettingStartedChecklistProps {
    onNavigate: (screen: NavItem) => void;
}

const GettingStartedChecklist: React.FC<GettingStartedChecklistProps> = ({ onNavigate }) => {
    const { checklist } = useAppContext();
    
    const items = [
        { key: 'addedAccount', text: 'Ajouter votre premier compte', screen: 'Comptes' as NavItem, done: checklist.addedAccount },
        { key: 'addedTransaction', text: 'Enregistrer une transaction', screen: 'Transactions' as NavItem, done: checklist.addedTransaction },
        { key: 'createdBudget', text: 'Créer votre premier budget', screen: 'Budget' as NavItem, done: checklist.createdBudget },
        { key: 'setGoal', text: 'Définir un objectif d\'épargne', screen: 'Objectifs' as NavItem, done: checklist.setGoal },
    ];
    
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6">
            <h3 className="font-bold text-dark dark:text-light mb-3">Pour bien commencer</h3>
            <div className="space-y-2">
                {items.map(item => (
                    <button 
                        key={item.key}
                        onClick={() => !item.done && onNavigate(item.screen)}
                        disabled={item.done}
                        className="w-full flex items-center p-2 rounded-lg text-left transition-colors disabled:cursor-default group"
                    >
                        <div className="w-6 h-6 mr-3">
                            {item.done ? (
                                <CheckCircleIcon className="w-6 h-6 text-success" />
                            ) : (
                                <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-500 rounded-full group-hover:border-primary transition-colors"></div>
                            )}
                        </div>
                        <span className={`flex-grow font-medium ${item.done ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-dark dark:text-light group-hover:text-primary'}`}>
                            {item.text}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GettingStartedChecklist;