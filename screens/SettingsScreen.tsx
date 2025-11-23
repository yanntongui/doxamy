import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from '../components/Icons';

interface SettingsScreenProps {
    onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="p-4 bg-light dark:bg-gray-900 min-h-full">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="text-primary font-bold">&lt; Retour</button>
                <h1 className="text-xl font-bold text-dark dark:text-light mx-auto">Paramètres</h1>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm max-w-lg mx-auto">
                <h2 className="text-lg font-semibold text-dark dark:text-light mb-4">Apparence</h2>
                <div className="flex justify-between items-center p-4 bg-light dark:bg-gray-700 rounded-lg">
                    <span className="font-medium text-dark dark:text-light">Thème Sombre</span>
                    <button
                        onClick={toggleTheme}
                        className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-gray-200 dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        <span className={`${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform flex items-center justify-center`}>
                            {theme === 'dark' ? <MoonIcon className="w-3 h-3 text-gray-800" /> : <SunIcon className="w-3 h-3 text-yellow-500" />}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;