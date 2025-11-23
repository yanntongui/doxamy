import React from 'react';
import { FolderIcon } from '../components/Icons';

interface CategoriesScreenProps {
    onBack: () => void;
}

const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ onBack }) => {
    return (
        <div className="p-4 bg-light dark:bg-gray-900 min-h-full">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="text-primary font-bold">&lt; Retour</button>
                <h1 className="text-xl font-bold text-dark dark:text-light mx-auto">Catégories</h1>
            </div>
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <FolderIcon className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Cette fonctionnalité est en cours de développement.</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Gérez ici vos catégories de dépenses et de revenus.</p>
            </div>
        </div>
    );
};

export default CategoriesScreen;