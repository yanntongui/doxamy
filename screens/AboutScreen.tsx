import React from 'react';
import { InfoIcon, LogoIcon } from '../components/Icons';

interface AboutScreenProps {
    onBack: () => void;
}

const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
    return (
        <div className="p-4 bg-light dark:bg-gray-900 min-h-full">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="text-primary font-bold">&lt; Retour</button>
                <h1 className="text-xl font-bold text-dark dark:text-light mx-auto">À Propos</h1>
            </div>
            <div className="text-center p-8 bg-white dark:bg-dark-card rounded-xl">
                <LogoIcon className="w-20 h-20 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-dark dark:text-light">doxamy</h2>
                <p className="text-gray-500 dark:text-text-secondary mb-4">Version 1.0.0</p>
                <p className="text-gray-600 dark:text-text-secondary">Votre Avenir Financier en Main.</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-6">© 2024 doxamy. Tous droits réservés.</p>
            </div>
        </div>
    );
};

export default AboutScreen;