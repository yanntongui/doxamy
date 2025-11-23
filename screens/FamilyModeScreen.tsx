import React, { useState } from 'react';
import { UsersIcon, PlusIcon, XIcon, ChevronRightIcon } from '../components/Icons';
import { useAppContext } from '../context/AppContext';

interface FamilyModeScreenProps {
    onBack: () => void;
}

const InviteForm: React.FC<{ spaceId: string }> = ({ spaceId }) => {
    const { inviteToFamilySpace } = useAppContext();
    const [email, setEmail] = useState('');

    const handleInvite = () => {
        if (email.trim()) {
            inviteToFamilySpace(spaceId, email.trim());
            setEmail('');
        }
    };

    return (
        <div>
            <label className="text-xs font-medium text-gray-600 dark:text-text-secondary">Inviter un nouveau membre</label>
            <div className="flex space-x-2 mt-1">
                <input
                    type="email"
                    placeholder="email@exemple.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="flex-grow px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-dark dark:text-light"
                />
                <button onClick={handleInvite} className="bg-secondary text-white font-semibold px-4 rounded-md">Inviter</button>
            </div>
        </div>
    );
};

const FamilyModeScreen: React.FC<FamilyModeScreenProps> = ({ onBack }) => {
    const { familySpaces, userProfile, createFamilySpace, leaveFamilySpace } = useAppContext();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newSpaceName, setNewSpaceName] = useState('');

    const handleCreateSpace = () => {
        if (newSpaceName.trim()) {
            createFamilySpace(newSpaceName.trim());
            setNewSpaceName('');
            setShowCreateForm(false);
        }
    };

    return (
        <div className="p-4 bg-light dark:bg-gray-900 min-h-full">
            <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="text-primary font-bold">&lt; Retour</button>
                <h1 className="text-xl font-bold text-dark dark:text-light">Mode Famille/Couple</h1>
                <button onClick={() => setShowCreateForm(true)} className="bg-primary text-white text-sm font-bold py-2 px-3 rounded-lg flex items-center">
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Créer
                </button>
            </div>

            {familySpaces.length === 0 ? (
                <div className="text-center p-8 bg-white dark:bg-dark-card rounded-xl">
                    <UsersIcon className="w-16 h-16 text-primary mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-text-muted mb-4">Vous n'êtes dans aucun espace familial.</p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm">Créez un espace pour inviter des membres de votre famille ou votre partenaire et gérer un budget commun.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {familySpaces.map(space => (
                        <div key={space.id} className="bg-white dark:bg-dark-card p-4 rounded-xl">
                            <h2 className="font-bold text-dark dark:text-light text-lg mb-3">{space.name}</h2>
                            <p className="text-sm font-medium text-gray-600 dark:text-text-secondary mb-2">Membres ({space.members.length})</p>
                            <div className="space-y-1 text-sm text-gray-500 dark:text-text-secondary">
                                {space.members.map(member => (
                                    <p key={member}>{member} {member === space.ownerId && '(Propriétaire)'}</p>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t dark:border-dark-border">
                                {space.ownerId === userProfile.email ? (
                                    <InviteForm spaceId={space.id} />
                                ) : (
                                    <button onClick={() => leaveFamilySpace(space.id)} className="w-full text-center py-2 bg-danger/10 text-danger rounded-lg font-semibold">
                                        Quitter cet espace
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateForm && (
                <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-card rounded-xl p-6 w-full max-w-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-dark dark:text-light text-lg">Créer un Espace</h3>
                            <button onClick={() => setShowCreateForm(false)}><XIcon className="w-6 h-6 text-gray-500 dark:text-text-secondary hover:text-dark dark:hover:text-light" /></button>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nom de l'espace</label>
                            <input type="text" value={newSpaceName} onChange={e => setNewSpaceName(e.target.value)} placeholder="Ex: Famille Dupont" className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-dark dark:text-light" />
                        </div>
                        <button onClick={handleCreateSpace} className="mt-6 w-full bg-primary text-white font-bold py-3 rounded-lg">Créer l'espace</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FamilyModeScreen;