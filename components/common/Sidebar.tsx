import React, { useState } from 'react';
import { type NavItem } from '../../types';
// FIX: Replaced ExpensesIcon with TransactionIcon as it's the correct icon component.
import { DashboardIcon, TransactionIcon, GoalsIcon, MoreIcon, PiggyBankIcon, LogoIcon, SwitchHorizontalIcon } from '../Icons';
import { useAppContext } from '../../context/AppContext';


const SpaceSwitcher: React.FC = () => {
    const { currentView, setCurrentView, familySpaces } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (view: any) => {
        setCurrentView(view);
        setIsOpen(false);
    }

    return (
        <div className="relative mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Espace actuel</p>
                    <p className="font-bold text-dark dark:text-light">{currentView.type === 'personal' ? 'Personnel' : currentView.spaceName}</p>
                </div>
                <SwitchHorizontalIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-700 rounded-lg shadow-xl border dark:border-gray-600 z-10 py-1">
                    <button onClick={() => handleSelect({ type: 'personal' })} className="w-full text-left px-4 py-2 text-sm text-dark dark:text-light hover:bg-gray-100 dark:hover:bg-gray-600">Personnel</button>
                    {familySpaces.map(space => (
                        <button key={space.id} onClick={() => handleSelect({ type: 'family', spaceId: space.id, spaceName: space.name })} className="w-full text-left px-4 py-2 text-sm text-dark dark:text-light hover:bg-gray-100 dark:hover:bg-gray-600">{space.name}</button>
                    ))}
                </div>
            )}
        </div>
    )
}


const navItems: { name: NavItem; icon: React.ComponentType<{ className?: string }> }[] = [
  { name: 'Tableau de Bord', icon: DashboardIcon },
  // FIX: Changed 'Dépenses' to 'Transactions' to match the NavItem type and use the correct icon.
  { name: 'Transactions', icon: TransactionIcon },
  { name: 'Budget', icon: PiggyBankIcon },
  { name: 'Objectifs', icon: GoalsIcon },
  { name: 'Plus', icon: MoreIcon },
];

interface SidebarProps {
  activeItem: NavItem;
  onNavigate: (item: NavItem) => void;
}


const Sidebar: React.FC<SidebarProps> = ({ activeItem, onNavigate }) => {
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 p-4">
      <div className="flex items-center space-x-2 mb-8 px-2 pt-4">
        <LogoIcon className="w-10 h-10" />
        <span className="text-2xl font-bold text-dark dark:text-light">doxamy</span>
      </div>
      
      <SpaceSwitcher />
      
      <nav className="flex flex-col space-y-2">
        {navItems.map(({ name, icon: Icon }) => (
          <button
            key={name}
            onClick={() => onNavigate(name)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-md transition-colors w-full text-left ${
              activeItem === name
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Icon className="w-6 h-6" />
            <span>{name}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;