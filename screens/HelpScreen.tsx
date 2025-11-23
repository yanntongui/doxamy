import React from 'react';
import { HelpIcon } from '../components/Icons';

interface HelpScreenProps {
    onBack: () => void;
}

const HelpScreen: React.FC<HelpScreenProps> = ({ onBack }) => {
    return (
        <div className="p-4 bg-light dark:bg-gray-900 min-h-full">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="text-primary font-bold">&lt; Retour</button>
                <h1 className="text-xl font-bold text-dark dark:text-light mx-auto">Aide & Support</h1>
            </div>
            <div className="text-center p-8 bg-white dark:bg-dark-card rounded-xl">
                <HelpIcon className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-gray-600 dark:text-text-muted">Cette fonctionnalité est en cours de développement.</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Trouvez des réponses à vos questions ou contactez notre support.</p>
            </div>
        </div>
    );
};

export default HelpScreen;