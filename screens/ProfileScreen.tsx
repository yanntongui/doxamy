import React, { useState, useEffect, useRef } from 'react';
import { PencilIcon } from '../components/Icons';
import { useAppContext } from '../context/AppContext';

interface ProfileScreenProps {
    onBack: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
    const { userProfile, handleUpdateProfile } = useAppContext();
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(userProfile.name);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditedName(userProfile.name);
    }, [userProfile.name, isEditing]);

    const handleSave = () => {
        handleUpdateProfile({ name: editedName });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedName(userProfile.name);
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                handleUpdateProfile({ avatar: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="p-4 bg-light dark:bg-gray-900 min-h-full">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="text-primary font-bold">&lt; Retour</button>
                <h1 className="text-xl font-bold text-dark dark:text-light mx-auto">Mon Profil</h1>
            </div>
            <div className="bg-white dark:bg-dark-card p-6 rounded-xl max-w-lg mx-auto">
                <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                        <img src={userProfile.avatar} alt="Avatar" className="w-24 h-24 rounded-full" />
                        <button onClick={handleAvatarClick} className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
                            <PencilIcon className="w-4 h-4" />
                        </button>
                    </div>

                    {!isEditing ? (
                        <h2 className="text-2xl font-bold text-dark dark:text-light">{userProfile.name}</h2>
                    ) : (
                        <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="text-2xl font-bold text-dark dark:text-light text-center bg-gray-100 dark:bg-gray-700 border-b-2 border-primary focus:outline-none rounded-t-md p-2"
                        />
                    )}
                    <p className="text-gray-500 dark:text-text-secondary">{userProfile.email}</p>
                </div>

                <div className="mt-8 border-t dark:border-dark-border pt-6 space-y-4">
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-600 dark:text-text-secondary">Email</span>
                        <span className="text-gray-800 dark:text-gray-100">{userProfile.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600 dark:text-text-secondary">Nom</span>
                        {!isEditing ? (
                            <span className="text-gray-800 dark:text-gray-100">{userProfile.name}</span>
                        ) : (
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="text-right bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-primary text-dark dark:text-light"
                            />
                        )}
                    </div>
                </div>

                <div className="mt-8">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full flex items-center justify-center bg-primary/10 text-primary font-bold py-3 rounded-lg hover:bg-primary/20 transition-colors"
                        >
                            <PencilIcon className="w-5 h-5 mr-2" />
                            Modifier le profil
                        </button>
                    ) : (
                        <div className="flex space-x-3">
                            <button
                                onClick={handleCancel}
                                className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 bg-primary text-white font-bold py-3 rounded-lg hover:bg-blue-700"
                            >
                                Enregistrer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileScreen;