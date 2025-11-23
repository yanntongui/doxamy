import React, { useState } from 'react';
import { ProfileIcon, FolderIcon, UsersIcon, SettingsIcon, HelpIcon, LogoutIcon, ChevronRightIcon, FileTextIcon, InfoIcon, SwitchHorizontalIcon, ScaleIcon, ShoppingListIcon } from '../components/Icons';
import { type NavItem } from '../types';
import { useAppContext } from '../context/AppContext';


const SpaceSwitcher: React.FC = () => {
  const { currentView, setCurrentView, familySpaces } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (view: any) => {
    setCurrentView(view);
    setIsOpen(false);
  }

  return (
    <div className="relative mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border dark:border-gray-700 shadow-sm"
      >
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Espace actuel</p>
          <p className="font-bold text-dark dark:text-light">{currentView.type === 'personal' ? 'Personnel' : currentView.spaceName}</p>
        </div>
        <SwitchHorizontalIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-700 rounded-lg shadow-xl border dark:border-gray-600 z-20 py-1">
          <button onClick={() => handleSelect({ type: 'personal' })} className="w-full text-left px-4 py-2 text-sm text-dark dark:text-light hover:bg-gray-100 dark:hover:bg-gray-600">Personnel</button>
          {familySpaces.map(space => (
            <button key={space.id} onClick={() => handleSelect({ type: 'family', spaceId: space.id, spaceName: space.name })} className="w-full text-left px-4 py-2 text-sm text-dark dark:text-light hover:bg-gray-100 dark:hover:bg-gray-600">{space.name}</button>
          ))}
        </div>
      )}
    </div>
  )
}

interface MoreScreenProps {
  onNavigate: (screen: NavItem) => void;
}

const MoreScreen: React.FC<MoreScreenProps> = ({ onNavigate }) => {
  const { handleLogout } = useAppContext();

  const handleItemClick = (screen: NavItem, name: string) => {
    if (name === "Déconnexion") {
      if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
        handleLogout();
      }
    } else {
      onNavigate(screen);
    }
  };

  const menuItems = [
    { name: "Mon Profil", icon: ProfileIcon, screen: 'Profil' as NavItem },
    { name: "Multi-Comptes", icon: UsersIcon, screen: 'Comptes' as NavItem },
    { name: "Mode Famille/Couple", icon: UsersIcon, screen: 'Famille' as NavItem },
    { name: "Listes de Courses", icon: ShoppingListIcon, screen: 'Listes' as NavItem },
    { name: "Catégories", icon: FolderIcon, screen: 'Catégories' as NavItem },
    { name: "Rapports & Analyses", icon: FileTextIcon, screen: 'Rapports' as NavItem },
    { name: "Dettes & Créances", icon: ScaleIcon, screen: 'Dettes' as NavItem },
    { name: "Paramètres de l'Application", icon: SettingsIcon, screen: 'Paramètres' as NavItem },
    { name: "Aide & Support", icon: HelpIcon, screen: 'Aide' as NavItem },
    { name: "À Propos", icon: InfoIcon, screen: 'À Propos' as NavItem },
    { name: "Déconnexion", icon: LogoutIcon, screen: 'Plus' as NavItem, color: "text-danger" },
  ];

  return (
    <div className="bg-light dark:bg-gray-900 min-h-full">
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-dark dark:text-light text-center">Plus</h1>
      </div>
      <div className="p-4">
        <SpaceSwitcher />
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          {menuItems.map((item, index) => (
            <button
              key={item.name}
              onClick={() => handleItemClick(item.screen, item.name)}
              className={`w-full flex items-center p-4 text-left ${index < menuItems.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
            >
              <item.icon className={`w-6 h-6 mr-4 ${item.color || 'text-gray-500 dark:text-gray-400'}`} />
              <span className={`flex-grow font-medium ${item.color || 'text-dark dark:text-light'}`}>{item.name}</span>
              {item.name !== "Déconnexion" && <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoreScreen;